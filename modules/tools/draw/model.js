/**
 * Module for drawing different geometries and text
 * @exports module:lgv.lgv/modules/tools/draw/model
 * @module lgv/modules/tools/draw/model
 */
import {Select, Modify, Draw} from "ol/interaction.js";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import Tool from "../../core/modelList/tool/model";

const DrawTool = Tool.extend({
    /**
     * @class DrawTool
     * @name module:lgv.lgv/modules/tools/draw/model
     * @augments Backbone.Model
     */
    defaults: _.extend({}, Tool.prototype.defaults, {
        drawInteraction: undefined,
        selectInteraction: undefined,
        modifyInteraction: undefined,
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
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                var layer = model.createLayer(model.get("layer"));

                if (value) {
                    this.setLayer(layer);
                    this.createDrawInteractionAndAddToMap(layer, this.get("drawType"), true);
                    this.createSelectInteractionAndAddToMap(layer, false);
                    this.createModifyInteractionAndAddToMap(layer, false);
                    this.off(this);
                    this.createSourceListenerForStyling(layer);
                }
            }
        });
    },
    createSourceListenerForStyling: function (layer) {
        var source = layer.getSource();

        source.on("addfeature", function (evt) {
            evt.feature.setStyle(this.getStyle());
        }.bind(this));
    },
    /**
     * creates a vector layer for drawn features, if layer input is undefined
     * and removes this callback from the change:isCurrentWin event
     * because only one layer to be needed
     * @param {ol/layer/Vector} layer - could be undefined
     * @return {ol/layer/Vector} vectorLayer
     */
    createLayer: function (layer) {
        var vectorLayer = layer;

        if (_.isUndefined(vectorLayer)) {
            vectorLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");
        }

        return vectorLayer;
    },
    createDrawInteractionAndAddToMap: function (layer, drawType, isActive) {
        var drawInteraction = this.createDrawInteraction(drawType, layer);

        drawInteraction.setActive(isActive);
        this.setDrawInteraction(drawInteraction);
        this.createDrawInteractionListener(drawInteraction);
        Radio.trigger("Map", "addInteraction", drawInteraction);
    },
    createSelectInteractionAndAddToMap: function (layer, isActive) {
        var selectInteraction = this.createSelectInteraction(layer);

        selectInteraction.setActive(isActive);
        this.setSelectInteraction(selectInteraction);
        this.createSelectInteractionListener(selectInteraction, layer);
        Radio.trigger("Map", "addInteraction", selectInteraction);
    },
    createModifyInteractionAndAddToMap: function (layer, isActive) {
        var modifyInteraction = this.createModifyInteraction(layer);

        modifyInteraction.setActive(isActive);
        this.setModifyInteraction(modifyInteraction);
        Radio.trigger("Map", "addInteraction", modifyInteraction);
    },

    /**
     * creates the draw to draw in the map
     * @param {object} drawType - contains the geometry and description
     * @param {ol/layer/Vector} layer - layer to draw
     * @param {array} color - of geometries
     * @return {ol/interaction/Draw} draw
     */
    createDrawInteraction: function (drawType, layer) {
        return new Draw({
            source: layer.getSource(),
            type: drawType.geometry,
            style: this.getStyle()
        });
    },

    /**
     * lister to change the entries for the next drawing
     * @param {ol/interaction/Draw} drawInteraction - drawInteraction
     * @return {void}
     */
    createDrawInteractionListener: function (drawInteraction) {
        drawInteraction.on("drawend", function (evt) {
            evt.feature.set("styleId", _.uniqueId());
        });
    },
    updateDrawInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        this.createDrawInteractionAndAddToMap(this.get("layer"), this.get("drawType"), true);
    },
    /**
     * @param {object} drawType - contains the geometry and description
     * @param {array} color - of drawings
     * @return {ol/style/Style} style
     */
    getStyle: function () {
        var style = new Style(),
            drawType = this.get("drawType"),
            color = this.get("color"),
            text = this.get("text"),
            font = this.get("font"),
            fontSize = this.get("fontSize"),
            strokeWidth = this.get("strokeWidth"),
            radius = this.get("radius");

        if (_.has(drawType, "text") && drawType.text === "Text schreiben") {
            style = this.getTextStyle(color, text, fontSize, font);
        }
        else if (_.has(drawType, "geometry") && drawType.geometry) {
            style = this.getDrawStyle(color, drawType.geometry, strokeWidth, radius);
        }

        return style.clone();
    },

    /**
     * Creates a feature style for text and returns it
     * @param {number} color - of drawings
     * @param {string} text - of drawings
     * @param {number} fontSize - of drawings
     * @param {string} font - of drawings
     * @return {ol/style/Style} style
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
     * @return {ol/style/Style} style
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

        this.deactivateDrawInteraction();
        this.deactivateModifyInteraction();
        this.deactivateSelectInteraction();

        this.setRadius(this.defaults.radius);
        this.setOpacity(this.defaults.opacity);
        this.setColor(defaultColor);

        this.setDrawType(this.defaults.drawType.geometry, this.defaults.drawType.text);
    },

    /**
     * creates and sets an interaction for selecting vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    startSelectInteraction: function (layer) {
        var selectInteraction = this.createSelectInteraction(layer);

        this.createSelectInteractionListener(selectInteraction, layer);
        this.setSelectInteraction(selectInteraction);
    },

    /**
     * creates an interaction for selecting vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @return {ol/interaction/Select} selectInteraction
     */
    createSelectInteraction: function (layer) {
        return new Select({
            layers: [layer]
        });
    },

    /**
     * craete an listener for select interaction
     * @param {ol/interaction/Select} selectInteraction - selectInteraction
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @return {void}
     */
    createSelectInteractionListener: function (selectInteraction, layer) {
        selectInteraction.on("select", function (evt) {
            // remove feature from source
            layer.getSource().removeFeature(evt.selected[0]);
            // remove feature from interaction
            this.getFeatures().clear();
        });
    },

    /**
     * creates and sets a interaction for modify vector features
     * @param {ol/layer/Vector} layer - for the selected(deleted) features
     * @returns {void}
     */
    createModifyInteraction: function (layer) {
        return new Modify({
            source: layer.getSource()
        });
    },

    /**
     * deletes all geometries from the layer
     * @return {void}
     */
    deleteFeatures: function () {
        this.get("layer").getSource().clear();
    },

    /**
     * toggle between modify, trash and draw modes
     * @param {string} mode - from active button
     * @return {void}
     */
    toggleInteraction: function (mode) {
        if (mode.indexOf("modify") !== -1) {
            this.deactivateDrawInteraction();
            this.activateModifyInteraction();
        }
        else if (mode.indexOf("trash") !== -1) {
            this.deactivateDrawInteraction();
            this.deactivateModifyInteraction();
            this.activateSelectInteraction();
        }
        else if (mode.indexOf("draw") !== -1) {
            this.deactivateModifyInteraction();
            this.deactivateSelectInteraction();
            this.activateDrawInteraction();
        }
    },

    /**
     * activate draw interaction
     * @return {void}
     */
    activateDrawInteraction: function () {
        if (!_.isUndefined(this.get("drawInteraction"))) {
            this.get("drawInteraction").setActive(true);
        }
    },

    /**
     * deactivates draw interaction
     * @return {void}
     */
    deactivateDrawInteraction: function () {
        if (!_.isUndefined(this.get("drawInteraction"))) {
            this.get("drawInteraction").setActive(false);
        }
    },

    /**
     * activate modify interaction
     * and change glyphicon to wrench
     * @return {void}
     */
    activateModifyInteraction: function () {
        if (!_.isUndefined(this.get("modifyInteraction"))) {
            this.get("modifyInteraction").setActive(true);
            this.putGlyphToCursor("glyphicon glyphicon-wrench");
        }
    },

    /**
     * deactivate modify interaction
     * and change glyphicon to pencil
     * @return {void}
     */
    deactivateModifyInteraction: function () {
        if (!_.isUndefined(this.get("modifyInteraction"))) {
            this.get("modifyInteraction").setActive(false);
            this.putGlyphToCursor("glyphicon glyphicon-pencil");
        }
    },

    /**
     * activate selct interaction
     * and change glyphicon to trash
     * @return {void}
     */
    activateSelectInteraction: function () {
        this.get("selectInteraction").setActive(true);
        this.putGlyphToCursor("glyphicon glyphicon-trash");
    },

    /**
     * deactivate selct interaction
     * and change glyphicon to pencil
     * @return {void}
     */
    deactivateSelectInteraction: function () {
        if (!_.isUndefined(this.get("selectInteraction"))) {
            this.get("selectInteraction").setActive(false);
            this.putGlyphToCursor("glyphicon glyphicon-pencil");
        }
    },

    /**
     * Creates an HTML element,
     * puts the glyph icon there and sticks it to the cursor
     * @param {string} glyphicon - of the mouse
     * @return {void}
     */
    putGlyphToCursor: function (glyphicon) {
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
     * Starts the download tool
     * @returns {void}
     */
    startDownloadTool: function () {
        var features = this.get("layer").getSource().getFeatures(),
            downloadView = this.get("downloadView");

        downloadView.start({
            data: features,
            formats: ["kml"],
            caller: {
                name: "draw",
                glyph: "glyphicon-pencil"
            }});
    },

    /**
     * setter for drawType
     * @param {string} value1 - geometry
     * @param {string} value2 - text
     * @return {void}
     */
    setDrawType: function (value1, value2) {
        this.set("drawType", {geometry: value1, text: value2});
    },

    /**
     * setter for font
     * @param {string} value - font
     * @return {void}
     */
    setFont: function (value) {
        this.set("font", value);
    },

    /**
     * setter for fontSize
     * @param {number} value - fontSize
     * @return {void}
     */
    setFontSize: function (value) {
        this.set("fontSize", value);
    },

    /**
     * setter for color
     * @param {array} value - color
     * @return {void}
     */
    setColor: function (value) {
        this.set("color", value);
    },

    /**
     * setter for opacity
     * @param {number} value - opacity
     * @return {void}
     */
    setOpacity: function (value) {
        this.set("opacity", value);
    },

    /**
     * setter for text
     * @param {string} value - text
     * @return {void}
     */
    setText: function (value) {
        this.set("text", value);
    },

    /**
     * setter for radius
     * @param {number} value - radius
     * @return {void}
     */
    setRadius: function (value) {
        this.set("radius", parseInt(value, 10));
    },

    /**
     * setter for strokeWidth
     * @param {number} value - strokeWidth
     * @return {void}
     */
    setStrokeWidth: function (value) {
        this.set("strokeWidth", parseInt(value, 10));
    },

    /**
     * setter for layer
     * @param {ol/layer/Vector} value - layer
     * @return {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * setter for selectInteraction
     * @param {ol/interaction/select} value - selectInteraction
     * @return {void}
     */
    setSelectInteraction: function (value) {
        this.set("selectInteraction", value);
    },

    /**
     * setter for drawInteraction
     * @param {ol/interaction/Draw} value - drawInteraction
     * @return {void}
     */
    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },

    /**
     * setter for modifyInteraction
     * @param {ol/interaction/modify} value - modifyInteraction
     * @return {void}
     */
    setModifyInteraction: function (value) {
        this.set("modifyInteraction", value);
    },

    /**
     * setter for modifyInteraction
     * @param {ol/interaction/modify} value - modifyInteraction
     * @return {void}
     */
    setDownloadView: function (value) {
        this.set("downloadView", value);
    }
});

export default DrawTool;
