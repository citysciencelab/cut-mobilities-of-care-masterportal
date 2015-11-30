define([
    "backbone",
    "openlayers",
    "eventbus"
], function (Backbone, ol, EventBus) {

    var Measure = Backbone.Model.extend({

        defaults: {
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(255, 127, 0, 0.3)"
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(255, 127, 0, 1.0)",
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 6,
                    stroke: new ol.style.Stroke({
                        color: "rgba(255, 127, 0, 1.0)",
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: "rgba(255, 127, 0, 0.4)"
                    })
                })
            }),
            type: "LineString",
            measureTooltips: []
        },

        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus,
                "pointerMoveOnMap": this.placeMeasureTooltip
            });

            this.listenTo(this, {
                "change:type": this.createInteraction
            });

            this.set("layer", new ol.layer.Vector({
                source: this.get("source"),
                style: this.get("style")
            }));

            EventBus.trigger("addLayer", this.get("layer"));
        },

        setStatus: function (args) {
            if (args[2] === "measure" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.createInteraction();
            }
            else {
                this.set("isCurrentWin", false);
                EventBus.trigger("removeInteraction", this.get("draw"));
            }
        },

        createInteraction: function () {
            EventBus.trigger("removeInteraction", this.get("draw"));
            this.set("draw", new ol.interaction.Draw({
                source: this.get("source"),
                type: this.get("type"),
                style: this.get("style")
            }));
            this.get("draw").on("drawstart", function (evt) {
                this.set("sketch", evt.feature);
                this.createMeasureTooltip();
            }, this);
            this.get("draw").on("drawend", function () {
                this.get("measureTooltipElement").className = "tooltip-default tooltip-static";
                this.get("measureTooltip").setOffset([0, -7]);
                // unset sketch
                this.get("sketch", null);
                // unset tooltip so that a new one can be created
                this.get("measureTooltipElement", null);
            }, this);
            EventBus.trigger("addInteraction", this.get("draw"));
        },

        createMeasureTooltip: function () {
            var measureTooltipElement,
                measureTooltip;

            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement("div");
            measureTooltipElement.className = "tooltip-default tooltip-measure";
            measureTooltip = new ol.Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: "bottom-center"
            });
            this.set("measureTooltipElement", measureTooltipElement);
            this.set("measureTooltip", measureTooltip);
            EventBus.trigger("addOverlay", measureTooltip, "measure");
            this.get("measureTooltips").push(measureTooltip);
        },

        placeMeasureTooltip: function (evt) {
            if (evt.dragging) {
                return;
            }
            if (this.get("measureTooltips").length > 0) {
                var tooltipCoord = evt.coordinate;

                if (this.get("sketch")) {
                    var output,
                        geom = this.get("sketch").getGeometry();

                    if (geom instanceof ol.geom.Polygon) {
                        output = this.formatArea(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    else if (geom instanceof ol.geom.LineString) {
                        output = this.formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    this.get("measureTooltipElement").innerHTML = output;
                    this.get("measureTooltip").setPosition(tooltipCoord);
                }
            }
        },

        /**
         * Setzt den Typ der Geometrie (LineString oder Polygon).
         * @param {String} value - Typ der Geometrie
         */
        setGeometryType: function (value) {
            this.set("type", value);
        },

        /**
         * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
         */
        deleteFeatures: function () {
            // lösche alle Geometrien
            this.get("source").clear();
            // lösche alle Overlays (Tooltips)
            _.each(this.get("measureTooltips"), function (tooltip) {
                EventBus.trigger("removeOverlay", tooltip, "measure");
            });
            this.set("measureTooltips", []);
        },

        /**
         * Berechnet die Länge der Strecke.
         * @param {ol.geom.LineString} line - Linestring geometry
         */
        formatLength: function (line) {
            var length = Math.round(line.getLength() * 100) / 100,
                output;

            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) + " " + "km";
            }
            else {
                output = (Math.round(length * 100) / 100) + " " + "m";
            }
            return output;
        },

        /**
         * Berechnet die Größe der Fläche.
         * @param {ol.geom.Polygon} polygon - Polygon geometry
         */
        formatArea: function (polygon) {
            var area = polygon.getArea(),
                output;

            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100) + " " + "km<sup>2</sup>";
            }
            else {
                output = (Math.round(area * 100) / 100) + " " + "m<sup>2</sup>";
            }
            return output;
        }
    });

    return new Measure();
});
