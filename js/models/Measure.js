define([
    "underscore",
    "backbone",
    "openlayers",
    "eventbus"
], function (_, Backbone, ol, EventBus) {

    var Measure = Backbone.Model.extend({

        "defaults": {
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    })
                   }),
            type: "LineString",
            measureTooltips: []
        },

        "initialize": function () {
            EventBus.on("winParams", this.setStatus, this);
            EventBus.on("pointerMoveOnMap", this.placeMeasureTooltip, this);
            this.on("change:type", this.createInteraction, this);

            this.set("layer", new ol.layer.Vector({
                source: this.get("source"),
                style: this.get("style")
            }));

            EventBus.trigger("addLayer", this.get("layer"));
        },

        "setStatus": function (args) {
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

        "createInteraction": function () {
            EventBus.trigger("removeInteraction", this.get("draw"));
            this.set('draw', new ol.interaction.Draw({
                source: this.get('source'),
                type: this.get("type")
            }));
            this.get('draw').on('drawstart', function (evt) {
                this.set("sketch", evt.feature);
                this.createMeasureTooltip();
            }, this);
            this.get("draw").on("drawend", function (evt) {
                this.get("measureTooltipElement").className = 'tooltip-default tooltip-static';
                this.get("measureTooltip").setOffset([0, -7]);
                // unset sketch
                this.get("sketch", null);
                // unset tooltip so that a new one can be created
                this.get("measureTooltipElement", null);
            }, this);
            EventBus.trigger("addInteraction", this.get("draw"));
        },

        "createMeasureTooltip": function () {
            var measureTooltipElement, measureTooltip;
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'tooltip-default tooltip-measure';
            measureTooltip = new ol.Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center'
            });
            this.set("measureTooltipElement", measureTooltipElement);
            this.set("measureTooltip", measureTooltip);
            EventBus.trigger('addOverlay', measureTooltip, "measure");
            this.get("measureTooltips").push(measureTooltip);
        },

        "placeMeasureTooltip": function (evt) {
            if (evt.dragging) {
                return;
            }
            if (this.get("measureTooltips").length > 0) {
                var tooltipCoord = evt.coordinate;

                if (this.get("sketch")) {
                    var output;
                    var geom = this.get("sketch").getGeometry();

                    if (geom instanceof ol.geom.Polygon) {
                        output = this.formatArea((geom));
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    }
                    else if (geom instanceof ol.geom.LineString) {
                        output = this.formatLength((geom));
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
        "setGeometryType": function (value) {
            this.set("type", value);
        },

        /**
         * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
         */
        "deleteFeatures": function () {
            // lösche alle Geometrien
            this.get("source").clear();
            // lösche alle Overlays (Tooltips)
            _.each(this.get("measureTooltips"), function (tooltip) {
                EventBus.trigger('removeOverlay', tooltip, "measure");
            });
            this.set("measureTooltips", []);
        },

        /**
         * Berechnet die Länge der Strecke.
         * @param {ol.geom.LineString} line - Linestring geometry
         */
        "formatLength": function (line) {
            var length = Math.round(line.getLength() * 100) / 100;
            var output;
            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
            }
            else {
                output = (Math.round(length * 100) / 100) + ' ' + 'm';
            }
            return output;
        },

        /**
         * Berechnet die Größe der Fläche.
         * @param {ol.geom.Polygon} polygon - Polygon geometry
         */
        "formatArea": function (polygon) {
            var area = polygon.getArea();
            var output;
            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
            }
            else {
                output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
            }
            return output;
        }
    });

    return new Measure();
});
