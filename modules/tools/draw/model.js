import {Select, Modify, Draw} from "ol/interaction.js";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import Tool from "../../core/modelList/tool/model";

const DrawTool = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defautls, {
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
        deactivateGFI: true
    }),

    initialize: function () {
        var channel = Radio.channel("Draw");

        this.superInitialize();
        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            }
        }, this);

        this.on("change:isActive", this.setStatus, this);
    },

    setStatus: function (model, value) {
        if (value) {
            if (this.get("layer") === undefined) {
                this.createLayer();
            }
            this.createDrawInteraction(this.get("drawType"), this.get("layer"));
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
            Radio.trigger("Map", "removeInteraction", this.get("selectInteraction"));
            Radio.trigger("Map", "removeInteraction", this.get("modifyInteraction"));
        }
    },

    /**
     * creates a vector layer for drawn features and removes this callback from the change:isCurrentWin event
     * because only one layer to be needed
     * @param {boolean} value - is tool active
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
        this.set("modifyInteraction", new Modify({
            features: layer.getSource().getFeaturesCollection()
        }));
    },

    createDrawInteraction: function (drawType, layer) {
        var that = this;

        Radio.trigger("Map", "removeInteraction", this.get("drawInteraction"));
        this.set("drawInteraction", new Draw({
            source: layer.getSource(),
            type: drawType.geometry,
            style: this.getStyle(drawType.text)
        }));
        this.get("drawInteraction").on("drawend", function (evt) {
            evt.feature.set("styleId", evt.feature.ol_uid);
            evt.feature.setStyle(that.getStyle(drawType.text));
        }, this);
        Radio.trigger("Map", "addInteraction", this.get("drawInteraction"));
    },

    getStyle: function (arg) {
        if (arg === "Text schreiben") {
            return this.getTextStyle(this.get("color"));
        }
        return this.getDrawStyle(this.get("color"), this.get("drawType").geometry);
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
        if (value.hasClass("modify")) {
            this.toggleModifyInteraction(this.get("drawInteraction").getActive());
        }
        else {
            this.toggleSelectInteraction(this.get("drawInteraction").getActive());
        }
    },
    // Aktiviert/Deaktiviert das Modifizieren von Features
    toggleModifyInteraction: function (value) {
        if (value) {
            Radio.trigger("Map", "addInteraction", this.get("modifyInteraction"));
            this.get("drawInteraction").setActive(false);
            this.setGlyphToCursor("glyphicon glyphicon-wrench");
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("modifyInteraction"));
            this.get("drawInteraction").setActive(true);
            this.setGlyphToCursor("glyphicon glyphicon-pencil");
        }
    },

    // Aktiviert/Deaktiviert ol.interaction.select. Auf Click wird das Feature gelöscht.
    toggleSelectInteraction: function (value) {
        if (value) {
            Radio.trigger("Map", "addInteraction", this.get("selectInteraction"));
            this.get("drawInteraction").setActive(false);
            this.setGlyphToCursor("glyphicon glyphicon-trash");
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("selectInteraction"));
            this.get("drawInteraction").setActive(true);
            this.setGlyphToCursor("glyphicon glyphicon-pencil");
        }
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
    }
});

export default DrawTool;
