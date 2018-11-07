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
     * @return {void}
     */
    setStatus: function () {
        if (_.isUndefined(this.get("layer"))) {
            this.createLayer();
        }
        this.createDrawInteraction(this.get("drawType"), this.get("layer"));
    },

    /**
     * creates a vector layer for drawn features and removes this callback from the change:isCurrentWin event
     * because only one layer to be needed
     * @returns {void}
     */
    createLayer: function () {
        var layer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");

        this.setLayer(layer);
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

    createDrawInteraction: function (drawType, layer) {
        var that = this;

        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        this.setDrawInteraction(new Draw({
            source: layer.getSource(),
            type: drawType.geometry,
            style: this.getStyle(drawType.text)
        }));
        this.get("drawInteraction").on("drawend", function (evt) {
            evt.feature.set("styleId", _.uniqueId());
            evt.feature.setStyle(that.getStyle(drawType.text));
        }, this);
        Radio.trigger("Map", "addInteraction", this.get("drawInteraction"));
    },

    getStyle: function (arg) {
        var color = [this.get("color")[0], this.get("color")[1], this.get("color")[2], this.get("color")[3]];

        if (arg === "Text schreiben") {
            return this.getTextStyle(this.get("color"));
        }
        return this.getDrawStyle(color, this.get("drawType").geometry);
    },

    /**
     * Erstellt ein Feature Style für Punkte, Linien oder Flächen und gibt ihn zurück.
     * @param {number} color -
     * @param {string} type -
     * @return {ol.style.Style} style
     */
    getDrawStyle: function (color, type) {
        return new Style({
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: color,
                width: this.get("strokeWidth")
            }),
            image: new Circle({
                radius: type === "Point" ? this.get("radius") : 6,
                fill: new Fill({
                    color: color
                })
            })
        });
    },

    /**
     * Erstellt ein Feature Style für Texte und gibt ihn zurück.
     * @param {number} color -
     * @return {ol.style.Style} style
     */
    getTextStyle: function (color) {
        return new Style({
            text: new Text({
                textAlign: "left",
                text: this.get("text"),
                font: this.get("fontSize") + "px " + this.get("font"),
                fill: new Fill({
                    color: color
                })
            })
        });
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
