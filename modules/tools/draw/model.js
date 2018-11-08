/**
 * Module for drawing different geometries and text
 * @exports module:modules.modules/tools/draw/model
 */
import {Select, Modify, Draw} from "ol/interaction.js";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import Tool from "../../core/modelList/tool/model";

const DrawTool = Tool.extend({
    /**
     * @class DrawTool
     * @name module:modules.modules/tools/draw/model
     * @constructor
     * @augments Backbone.Model
     */
    defaults: _.extend({}, Tool.prototype.defaults, {
        // ol.interaction.Draw
        drawInteraction: undefined,
        // ol.interaction.Select for the deleted features
        selectInteraction: undefined,
        // ol.interaction.Modify
        modifyInteraction: undefined,
        // destination layer for the drawn features
        layer: undefined,
        font: "Arial",
        fontSize: 10,
        text: "Klicken Sie auf die Karte um den Text zu platzieren",
        color: [55, 126, 184, 1],
        radius: 6,
        strokeWidth: 1,
        opacity: 1,
        drawType: {
            geometry: "Point",
            text: "Punkt zeichnen"
        },
        renderToWindow: true,
        deactivateGFI: true,
        glyphicon: "glyphicon-pencil"
    }),

    /**
     * create a DrawTool instance
     * @return {void}
     */
    initialize: function () {
        const channel = Radio.channel("Draw");

        this.superInitialize();

        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            }
        }, this);
    },

    /**
     * creates the interaction with a new drawing and the map
     * @return {void}
     */
    startDrawInteraction: function () {
        var layer = this.createLayer(this.get("layer")),
            drawInteraction;

        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        drawInteraction = this.createDrawInteraction(this.get("drawType"), layer, this.get("color"));

        this.setLayer(layer);
        this.setDrawInteraction(drawInteraction);

        this.createDrawInteractionListener();
        Radio.trigger("Map", "addInteraction", this.get("drawInteraction"));
    },

    /**
     * creates a vector layer for drawn features and removes this callback from the change:isCurrentWin event
     * because only one layer to be needed
     * @param {ol.VectorLayer} layer - could be undefined
     * @return {ol.VectorLayer} vectorLayer
     */
    createLayer: function (layer) {
        var vectorLayer = layer;

        if (_.isUndefined(vectorLayer)) {
            vectorLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");
        }

        return vectorLayer;
    },

    /**
     * creates the draw to draw in the map
     * @param {object} drawType - contains the geometry and description
     * @param {ol.VectorLayer} layer - layer to draw
     * @param {array} color - of geometries
     * @return {ol.Draw} draw
     */
    createDrawInteraction: function (drawType, layer, color) {
        return new Draw({
            source: layer.getSource(),
            type: drawType.geometry,
            style: this.getStyle(drawType, color)
        });
    },

    /**
     * lister to change the entries for the next drawing
     * @return {void}
     */
    createDrawInteractionListener: function () {
        this.get("drawInteraction").on("drawend", function (evt) {
            evt.feature.set("styleId", _.uniqueId());
            evt.feature.setStyle(this.getStyle(this.get("drawType"), this.get("color")));
        }.bind(this));
    },

    /**
     * @param {object} drawType - contains the geometry and description
     * @param {array} color - of drawings
     * @return {ol.style.Style} style
     */
    getStyle: function (drawType, color) {
        var style = new Style();

        if (_.has(drawType, "text") && drawType.text === "Text schreiben") {
            style = this.getTextStyle(color, this.get("text"), this.get("fontSize"), this.get("font"));
        }
        else if (_.has(drawType, "geometry") && drawType.geometry) {
            style = this.getDrawStyle(color, drawType.geometry, this.get("strokeWidth"), this.get("radius"));
        }

        return style;
    },

    /**
     * Creates a feature style for text and returns it
     * @param {number} color - of drawings
     * @param {string} text - of drawings
     * @param {number} fontSize - of drawings
     * @param {string} font - of drawings
     * @return {ol.style.Style} style
     */
    getTextStyle: function (color, text, fontSize, font) {
        return new Style({
            text: new Text({
                textAlign: "left",
                text: text,
                font: fontSize + "px " + font,
                fill: new Fill({
                    color: color
                })
            })
        });
    },

    /**
     * Creates and returns a feature style for points, lines, or faces
     * @param {number} color - of drawings
     * @param {string} drawGeometryType - geometry type of drawings
     * @param {number} strokeWidth - from geometry
     * @param {number} radius - from geometry
     * @return {ol.style.Style} style
     */
    getDrawStyle: function (color, drawGeometryType, strokeWidth, radius) {
        return new Style({
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: color,
                width: strokeWidth
            }),
            image: new Circle({
                radius: drawGeometryType === "Point" ? radius : 6,
                fill: new Fill({
                    color: color
                })
            })
        });
    },

    /**
     * resets the module to its initial state
     * @return {void}
     */
    resetModule: function () {
        const defaultColor = this.defaults.color;

        defaultColor.pop();
        defaultColor.push(this.defaults.opacity);

        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        Radio.trigger("Map", "removeInteraction", this.get("selectInteraction"));
        Radio.trigger("Map", "removeInteraction", this.get("modifyInteraction"));

        this.setRadius(this.defaults.radius);
        this.setOpacity(this.defaults.opacity);
        this.setColor(defaultColor);
        this.setDrawType(this.defaults.drawType.geometry, this.defaults.drawType.text);
        this.setDrawInteraction(this.defaults.drawInteraction);
        this.setSelectInteraction(this.defaults.selectInteraction);
        this.setModifyInteraction(this.defaults.modifyInteraction);
    },

    /**
     * creates and sets a interaction for selecting vector features
     * @param {ol.layer.Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    createSelectInteraction: function (layer) {
        var selectInteraction = new Select({
            layers: [layer]
        });

        selectInteraction.on("select", function (evt) {
            // remove feature from source
            layer.getSource().removeFeature(evt.selected[0]);
            // remove feature from interaction
            this.getFeatures().clear();
        });
        this.setSelectInteraction(selectInteraction);
    },

    /**
     * creates and sets a interaction for modify vector features
     * @param {ol.layer.Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    createModifyInteraction: function (layer) {
        this.setModifyInteraction(new Modify({
            source: layer.getSource()
        }));
    },

    // Löscht alle Geometrien
    deleteFeatures: function () {
        this.get("layer").getSource().clear();
    },

    toggleInteraction: function (value) {
        var mode;

        if (value.attr("class").indexOf("modify") !== -1) {
            mode = "modify";
        }
        else if (value.attr("class").indexOf("trash") !== -1) {
            mode = "select";
        }
        else if (value.attr("class").indexOf("draw") !== -1) {
            mode = "draw";
        }

        if (mode === "modify") {
            this.deactivateDrawInteraction();
            this.activateModifyInteraction();
        }
        else if (mode === "select") {
            this.deactivateDrawInteraction();
            this.deactivateModifyInteraction();
            this.activateSelectInteraction();
        }
        else if (mode === "draw") {
            this.deactivateModifyInteraction();
            this.deactivateSelectInteraction();
            this.activateDrawInteraction();
        }
    },
    deactivateDrawInteraction: function () {
        this.get("drawInteraction").setActive(false);
    },
    activateDrawInteraction: function () {
        this.get("drawInteraction").setActive(true);
    },
    activateModifyInteraction: function () {
        Radio.trigger("Map", "addInteraction", this.get("modifyInteraction"));
        this.setGlyphToCursor("glyphicon glyphicon-wrench");
    },
    deactivateModifyInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("modifyInteraction"));
        this.setGlyphToCursor("glyphicon glyphicon-pencil");
    },
    activateSelectInteraction: function () {
        Radio.trigger("Map", "addInteraction", this.get("selectInteraction"));
        this.setGlyphToCursor("glyphicon glyphicon-trash");
    },
    deactivateSelectInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("selectInteraction"));
        this.setGlyphToCursor("glyphicon glyphicon-pencil");
    },

    // Erstellt ein HTML-Element, legt dort das Glyphicon rein und klebt es an den Cursor
    setGlyphToCursor: function (glyphicon) {
        if (glyphicon.indexOf("trash") !== -1) {
            $("#map").removeClass("no-cursor");
            $("#map").addClass("cursor-crosshair");
        }
        else {
            $("#map").removeClass("cursor-crosshair");
            $("#map").addClass("no-cursor");
        }
        $("#cursorGlyph").removeClass();
        $("#cursorGlyph").addClass(glyphicon);
    },

    /**
     * Startet das Downloadmodul
     * @returns {void}
     */
    downloadFeatures: function () {
        var features = this.get("layer").getSource().getFeatures();

        Radio.trigger("download", "start", {
            data: features,
            formats: ["kml"],
            caller: {
                name: "draw",
                glyph: "glyphicon-pencil"
            }});
    },

    setDrawType: function (value1, value2) {
        this.set("drawType", {geometry: value1, text: value2});
    },

    setFont: function (value) {
        this.set("font", value);
    },


    setFontSize: function (value) {
        this.set("fontSize", value);
    },

    setColor: function (value) {
        this.set("color", value);
    },

    setOpacity: function (value) {
        this.set("opacity", value);
    },

    setText: function (value) {
        this.set("text", value);
    },

    setRadius: function (value) {
        this.set("radius", parseInt(value, 10));
    },

    setStrokeWidth: function (value) {
        this.set("strokeWidth", parseInt(value, 10));
    },

    setSelectInteraction: function (value) {
        this.set("selectInteraction", value);
    },

    setLayer: function (value) {
        this.set("layer", value);
    },

    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },

    setModifyInteraction: function (value) {
        this.set("modifyInteraction", value);
    }
});

export default DrawTool;
