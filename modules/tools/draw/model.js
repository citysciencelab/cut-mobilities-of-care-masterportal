define([
    "backbone",
    "openlayers",
    "backbone.radio"
], function () {
    var Backbone = require("backbone"),
        ol = require("openlayers"),
        Radio = require("backbone.radio"),
        DrawTool;

    DrawTool = Backbone.Model.extend({
        defaults: {
            selectClick: new ol.interaction.Select(),
            interactions: [
                { text: "Punkt zeichnen", type: "Point", name: "drawPoint" },
                { text: "Linie zeichnen", type: "LineString", name: "drawLine" },
                { text: "Polygon zeichnen", type: "Polygon", name: "drawArea" },
                { text: "Text schreiben", type: "Point", name: "writeText" }
                // ,
                // { text: "Kreis zeichnen", type: "Circle", name: "drawCircle" }
            ],
            selectedInteraction: "drawPoint",
            selectedType: "Point",
            fonts: ["Arial", "Times New Roman", "Calibri"],
            selectedFont: "Arial",
            fontSizes: [
                { name: "8 px", value: 8 },
                { name: "10 px", value: 10 },
                { name: "12 px", value: 12 },
                { name: "14 px", value: 14 },
                { name: "16 px", value: 16 },
                { name: "18 px", value: 18 },
                { name: "20 px", value: 20 },
                { name: "24 px", value: 24 },
                { name: "28 px", value: 28 },
                { name: "32 px", value: 32 }
            ],
            selectedFontSize: 16,
            text: "Klicken Sie auf die Karte um den Text zu platzieren",
            colors: [
                { name: "Blau", value: "rgba(55, 126, 184, 0.5)" },
                { name: "Gelb", value: "rgba(255, 255, 51, 0.5)" },
                { name: "Grau", value: "rgba(153, 153, 153, 0.5)" },
                { name: "Grün", value: "rgba(77, 175, 74, 0.5)" },
                { name: "Orange", value: "rgba(255, 127, 0, 0.5)" },
                { name: "Rot", value: "rgba(228, 26, 28, 0.5)" },
                { name: "Schwarz", value: "rgba(0, 0, 0, 0.5)" },
                { name: "Weiß", value: "rgba(255, 255, 255, 0.5)" }
            ],
            selectedColor: { name: "Blau", value: "rgba(55, 126, 184, 0.5)" },
            pointRadiuses: [
                { name: "6 px", value: 6 },
                { name: "8 px", value: 8 },
                { name: "10 px", value: 10 },
                { name: "12 px", value: 12 },
                { name: "14 px", value: 14 },
                { name: "16 px", value: 16 }
            ],
            radius: 6,
            strokeWidth: [
                { name: "1 px", value: 1 },
                { name: "2 px", value: 2 },
                { name: "3 px", value: 3 },
                { name: "4 px", value: 4 },
                { name: "5 px", value: 5 },
                { name: "6 px", value: 6 }
            ],
            selectedStrokeWidth: 1,
            opacity: [
                {name: "0 %", value: "1.0"},
                {name: "10 %", value: "0.9"},
                {name: "20 %", value: "0.8"},
                {name: "30 %", value: "0.7"},
                {name: "40 %", value: "0.6"},
                {name: "50 %", value: "0.5"},
                {name: "60 %", value: "0.4"},
                {name: "70 %", value: "0.3"},
                {name: "80 %", value: "0.2"},
                {name: "90 %", value: "0.1"}
            ],
            selectedOpacity: "0.5",
            circleTooltips: []
        },

        initialize: function () {
            var channel = Radio.channel("Draw");

            channel.reply({
                "getLayer": function () {
                    return this.get("layer");
                }
            }, this);

            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.listenTo(this, {
                "change:selectedInteraction": this.setStyle,
                "change:text": this.setStyle,
                "change:selectedFont": this.setStyle,
                "change:selectedFontSize": this.setStyle,
                "change:selectedColor change:radius change:selectedStrokeWidth change:selectedOpacity": this.setStyle
            });

            this.get("selectClick").on("select", function (evt) {
                var feature = evt.target.getFeatures().getArray()[0];

                if (_.isUndefined(feature) === false) {
                    // Feature aus der Source entfernen
                    this.get("source").removeFeature(feature);
                    // Selektierte Features werden in einem internen Layer gespeichert und auf der Karte dargestellt
                    // Selektierte Features wieder löschen
                    evt.target.getFeatures().clear();
                }
            }, this);
            var drawLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");
            this.set("layer", drawLayer);
            this.set("source", drawLayer.getSource());
            this.get("selectClick").setActive(false);
            Radio.trigger("Map", "addInteraction", this.get("selectClick"));
            Radio.trigger("Autostart", "initializedModul", "draw");
        },

        setStatus: function (args) {
            if (args[2].getId() === "draw" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.setStyle();
            }
            else {
                this.set("isCurrentWin", false);
                Radio.trigger("Map", "removeInteraction", this.get("draw"));
                Radio.trigger("Map", "addInteraction", this.get("selectClick"));
                this.get("selectClick").setActive(false);
            }
        },

        createInteraction: function () {
            Radio.trigger("Map", "removeInteraction", this.get("draw"));
            this.set("draw", new ol.interaction.Draw({
                source: this.get("source"),
                type: this.get("selectedType"),
                style: this.get("style")
            }));
            if (this.get("selectedType") === "Circle") {
                this.get("draw").on("drawstart", function (evt) {
                    this.listenTo(Radio.channel("Map"), {
                        "pointerMoveOnMap": this.placecircleTooltip
                    });
                    this.set("sketch", evt.feature);
                    this.createcircleTooltip();
                }, this);
            }
            this.get("draw").on("drawend", function (evt) {
                this.setDrawendCoords(evt.feature.getGeometry());
                evt.feature.setStyle(this.get("style"));
                _.each(this.get("circleTooltips"), function (tooltip) {
                    Radio.trigger("Map", "removeOverlay", tooltip, "circle");
                });
                this.stopListening(Radio.channel("Map"), "pointerMoveOnMap");
            }, this);
            Radio.trigger("Map", "addInteraction", this.get("draw"));
        },

        /**
         * Setzt den "Draw Type" (Point, LineString oder Polygon).
         */
        setType: function () {
            var selectedInteraction = _.findWhere(this.get("interactions"), {name: this.get("selectedInteraction")});

            this.set("selectedType", selectedInteraction.type);
            if (this.get("selectedType") !== "Point") {
                this.set("radius", 6);
            }
            this.createInteraction();
        },

        /**
         * Setzt die Interaction.
         * @param {string} value - drawPoint | drawLine | drawArea | writeText
         */
        setInteraction: function (value) {
            this.set("selectedInteraction", value);
        },

        /**
         * Setzt die Schriftart.
         * @param {string} value - Arial | Times New Roman | Calibri
         */
        setFont: function (value) {
            this.set("selectedFont", value);
        },

        /**
         * Setzt die Schriftgröße.
         * @param {number} value - 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32
         */
        setFontSize: function (value) {
            this.set("selectedFontSize", value);
        },

        /**
         * Setzt die Farbe für Schrift und Geometrie.
         * @param {string} value - Farbe
         */
        setColor: function (value) {
            var color = _.findWhere(this.get("colors"), {name: value});

            this.set("selectedColor", color);
        },

        /**
         * Setzt die Transparenz.
         * @param {string} value - 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0
         */
        setOpacity: function (value) {
            this.set("selectedOpacity", parseFloat(value, 10).toFixed(1));
        },

        /**
         * Setzt den Text.
         * @param {string} value - Text von $(".drawText")
         */
        setText: function (value) {
            this.set("text", value);
        },

        /**
         * Setzt den Radius.
         * @param {string} value - 6 | 8 | 10 | 12 | 14 | 16
         */
        setPointRadius: function (value) {
            this.set("radius", parseInt(value, 10));
        },

        /**
         * Setzt die Strichstärke.
         * @param {string} value - 1 | 2 | 3 | 4 | 5 | 6
         */
        setStrokeWidth: function (value) {
            this.set("selectedStrokeWidth", parseInt(value, 10));
        },

        /**
         * Setzt den Style für ein Feature.
         */
        setStyle: function () {
            if (this.get("selectedInteraction") === "writeText") {
                this.set("style", this.getTextStyle());
            }
            else {
                this.set("style", this.getDrawStyle());
            }
            this.setType();
        },

        /**
         * Erstellt ein Feature Style für Punkte, Linien oder Flächen und gibt ihn zurück.
         * @return {ol.style.Style}
         */
        getDrawStyle: function () {
            var rgbColor = this.get("selectedColor").value,
                opacity = this.get("selectedOpacity"),
                color;

            color = rgbColor.substr(0, rgbColor.length - 4) + opacity + ")";
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: color
                }),
                stroke: new ol.style.Stroke({
                    color: color.substr(0, color.length - 6) + ", 1)",
                    width: this.get("selectedStrokeWidth")
                }),
                image: new ol.style.Circle({
                    radius: this.get("radius"),
                    fill: new ol.style.Fill({
                        color: color
                    })
                })

            });
        },

        /**
         * Erstellt ein Feature Style für Texte und gibt ihn zurück.
         * @return {ol.style.Style}
         */
        getTextStyle: function () {
            var rgbColor = this.get("selectedColor").value;

            return new ol.style.Style({
                text: new ol.style.Text({
                    text: this.get("text"),
                    font: "8px " + this.get("selectedFont"),
                    fill: new ol.style.Fill({
                        color: rgbColor.substr(0, rgbColor.length - 6) + ", 1)"
                    }),
                    scale: this.get("selectedFontSize") / 8
                })
            });
        },

        // Löscht alle Geometrien
        deleteFeatures: function () {
            this.get("source").clear();
            // lösche alle Overlays (Tooltips)
            _.each(this.get("circleTooltips"), function (tooltip) {
                Radio.trigger("Map", "removeOverlay", tooltip, "circle");
            });
            this.set("circleTooltips", []);
        },

        // Aktiviert/Deaktiviert das Modifizieren von Features
        modifyFeatures: function () {
            if (this.get("modify") && this.get("modify").getActive() === true) {
                this.get("modify").setActive(false);
                this.get("draw").setActive(true);
                this.get("selectClick").setActive(false);

                $("#cursorGlyph").remove();
                $("#map").off("mousemove");
                this.setGlyphToCursor("glyphicon glyphicon-pencil");

                Radio.trigger("Map", "removeInteraction", this.get("modify"));
            }
            else {
                Radio.trigger("Map", "removeInteraction", this.get("modify"));
                this.set("modify", new ol.interaction.Modify({
                    features: this.get("source").getFeaturesCollection()
                }));
                this.get("modify").setActive(true);
                this.get("draw").setActive(false);
                this.get("selectClick").setActive(false);

                $("#cursorGlyph").remove();
                $("#map").off("mousemove");
                this.setGlyphToCursor("glyphicon glyphicon-wrench");
                Radio.trigger("Map", "addInteraction", this.get("modify"));
            }
        },
        // Erstellt ein HTML-Element, legt dort das Glyphicon rein und klebt es an den Cursor
        setGlyphToCursor: function (glyphicon) {
            $("#map").after("<span id='cursorGlyph'></span>");
            $("#map").mousemove(function (e) {
                    var cursorGlyph = $("#cursorGlyph");

                    $("#cursorGlyph").addClass(glyphicon);
                    cursorGlyph.css("left", e.offsetX + 10);
                    cursorGlyph.css("top", e.offsetY + 15);
            });
        },

        // Aktiviert/Deaktiviert ol.interaction.select. Auf Click wird das Feature gelöscht.
        toggleInteractions: function () {
            if (this.get("selectClick").getActive() === true) {
                this.get("selectClick").setActive(false);
                this.get("draw").setActive(true);

                $("#cursorGlyph").remove();
                $("#map").off("mousemove");
                this.setGlyphToCursor("glyphicon glyphicon-pencil");
            }
            else {
                this.get("selectClick").setActive(true);
                this.get("draw").setActive(false);

                $("#cursorGlyph").remove();
                $("#map").off("mousemove");
                this.setGlyphToCursor("glyphicon glyphicon-trash");
            }
        },

        /**
         * Startet das Downloadmodul
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
        setDrawendCoords: function (geom) {
            var geoJSON = new ol.format.GeoJSON();

            this.set("drawendCoords", geoJSON.writeGeometry(geom));
        },

        createcircleTooltip: function () {
            var circleTooltipElement,
                circleTooltip;

            if (circleTooltipElement) {
                circleTooltipElement.parentNode.removeChild(circleTooltipElement);
            }
            circleTooltipElement = document.createElement("div");
            circleTooltipElement.className = "tooltip-default-circle";
            circleTooltip = new ol.Overlay({
                element: circleTooltipElement,
                offset: [0, -15],
                positioning: "bottom-center"
            });
            this.set("circleTooltipElement", circleTooltipElement);
            this.set("circleTooltip", circleTooltip);
            Radio.trigger("Map", "addOverlay", circleTooltip, "circle");
            this.get("circleTooltips").push(circleTooltip);
        },
        placecircleTooltip: function (evt) {
            if (evt.dragging) {
                return;
            }
            if (this.get("circleTooltips").length > 0) {
                var tooltipCoord = evt.coordinate;

                if (this.get("sketch")) {
                    var geom = this.get("sketch").getGeometry();

                    tooltipCoord = geom.getLastCoordinate();
                    this.get("circleTooltipElement").innerHTML = "Radius: " + Math.round(geom.getRadius()) + "m";
                    this.get("circleTooltip").setPosition(tooltipCoord);
                }
            }
        }
    });

    return DrawTool;
});
