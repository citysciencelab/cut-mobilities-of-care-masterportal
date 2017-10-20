define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config",
    "cesium"
], function (Backbone, Radio, ol, Config, Cesium) {

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
            unit: "m",
            decimal: 1,
            measureTooltips: [],
            hits3d: [],
            quickHelp: false,
            isMap3d: false
        },

        initialize: function () {
            var layers = Radio.request("Map", "getLayers");

            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.listenTo(Radio.channel("Map"), {
                "activateMap3d": this.createInteraction,
                "deactivateMap3d": this.createInteraction,
            });

            this.listenTo(this, {
                "change:type": this.createInteraction
            });

            this.set("layer", new ol.layer.Vector({
                source: this.get("source"),
                style: this.get("style"),
                name: "measure_layer",
                alwaysOnTop: true
            }));

            Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), layers.getArray().length]);

            if (_.has(Config, "quickHelp") && Config.quickHelp === true) {
                this.set("quickHelp", true);
            }
        },
        setStatus: function (args) {
            if (args[2].getId() === "measure" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.createInteraction();
            }
            else {
                this.set("isCurrentWin", false);
                Radio.trigger("Map", "removeInteraction", this.get("draw"));
                this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
            }
        },

        handle3DClicked: function(obj) {
            var scene = Radio.request("Map", "getMap3d").getCesiumScene();

            var createFractionPoint = function (pointOne, pointTwo) {
                var geodesic = new Cesium.EllipsoidGeodesic(
                    scene.globe.ellipsoid.cartesianToCartographic(pointOne),
                    scene.globe.ellipsoid.cartesianToCartographic(pointTwo)
                );
                var cartographic = geodesic.interpolateUsingFraction(0.5);
                var coords = [
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude),
                    cartographic.height
                ];

                var mapProjection = Radio.request("MapView", "getProjection");
                return ol.proj.transform(coords, ol.proj.get("EPSG:4326"), mapProjection);
            };

            var object = scene.pick(obj.position);
            var hit;
            var cartographic;
            if (object) {
                hit = scene.pickPosition(obj.position);
                cartographic = scene.globe.ellipsoid.cartesianToCartographic(hit);
            } else {
                var ray = scene.camera.getPickRay(obj.position);
                hit = scene.globe.pick(ray, scene);
                cartographic = scene.globe.ellipsoid.cartesianToCartographic(hit);
                cartographic.height = scene.globe.getHeight(cartographic);
            }

            var coords = [
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude),
                cartographic.height
            ];

            var mapProjection = Radio.request("MapView", "getProjection");
            coords = ol.proj.transform(coords, ol.proj.get("EPSG:4326"), mapProjection);

            var hits3d = this.get("hits3d");
            var pointId = '__3dMeasurmentFirstPoint';
            var source = this.get("source");
            if (hits3d.length) {
                var firstHit = hits3d[0];
                var distance = Cesium.Cartesian3.distance(firstHit.cartesian, hit);
                var heightDiff = Math.abs(coords[2] - firstHit.coords[2]);
                var flatDistance = Math.sqrt(Math.pow(distance, 2) - Math.pow(heightDiff, 2));
                var heightPosition = firstHit.coords[2] < coords[2] ? firstHit.coords.slice() : coords.slice();
                heightPosition[2] = firstHit.coords[2] < coords[2] ? coords[2] : firstHit.coords[2];

                this.place3dMeasureTooltip(distance, coords);
                this.place3dMeasureTooltip(heightDiff, heightPosition);

                var fractionPoint = createFractionPoint(firstHit.cartesian, hit);
                fractionPoint[2] = heightPosition[2];
                this.place3dMeasureTooltip(flatDistance, fractionPoint);

                this.set("measureTooltip", null);
                source.addFeature(new ol.Feature({
                    geometry: new ol.geom.LineString([
                        firstHit.coords,
                        coords,
                        heightPosition,
                        firstHit.coords
                    ])
                }));
                this.set("hits3d", []);
                var firstPoint = source.getFeatureById(pointId);
                source.removeFeature(firstPoint);
            } else {
                var feautre = new ol.Feature({
                    geometry: new ol.geom.Point(coords)
                });
                feautre.setId(pointId);
                source.addFeature(feautre);
                hits3d.push({
                    cartesian: hit,
                    coords: coords
                });
            }
        },
        createInteraction: function () {
            if (!this.get("isCurrentWin")) {
                return;
            }
            Radio.trigger("Map", "removeInteraction", this.get("draw"));
            this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
            if (Radio.request("Map", "isMap3d")) {
                this.listenTo(Radio.channel("Map"), "clickedWindowPosition", this.handle3DClicked.bind(this));
                this.set("isMap3d", true);
                this.set("type", "3d");
                this.set("hits3d", []);
            } else {
                if (this.get("isMap3d")) {
                    this.set("isMap3d", false);
                    this.set("type", "LineString");
                }
                this.set("draw", new ol.interaction.Draw({
                    source: this.get("source"),
                    type: this.get("type"),
                    style: this.get("style")
                }));
                this.get("draw").on("drawstart", function (evt) {
                    Radio.trigger("Map", "registerListener", "pointermove", this.placeMeasureTooltip, this);
                    this.set("sketch", evt.feature);
                    this.createMeasureTooltip();
                }, this);
                this.get("draw").on("drawend", function () {
                    this.get("measureTooltipElement").className = "tooltip-default tooltip-static";
                    this.get("measureTooltip").setOffset([0, -7]);
                    // unset sketch
                    this.set("sketch", null);
                    // unset tooltip so that a new one can be created
                    this.set("measureTooltipElement", null);
                    Radio.trigger("Map", "unregisterListener", "pointermove", this.placeMeasureTooltip, this);
                }, this);
                Radio.trigger("Map", "addInteraction", this.get("draw"));
            }
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
            Radio.trigger("Map", "addOverlay", measureTooltip, "measure");
            this.get("measureTooltips").push(measureTooltip);
        },

        placeMeasureTooltip: function (evt) {
            if (evt.dragging) {
                return;
            }
            if (this.get("measureTooltips").length > 0) {
                this.setScale(Radio.request("MapView", "getOptions"));

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

        place3dMeasureTooltip: function (distance, position) {
            var output;
            if (this.get("unit") === "km") {
                output = (distance / 1000).toFixed(3) + " " + this.get("unit");
            } else {
                output = distance.toFixed(2) + " " + this.get("unit");
            }

            this.createMeasureTooltip();
            this.get("measureTooltipElement").innerHTML = output;
            this.get("measureTooltip").setPosition(position);
        },

        /**
         * Setzt den Typ der Geometrie (LineString oder Polygon).
         * @param {String} value - Typ der Geometrie
         */
        setGeometryType: function (value) {
            this.set("type", value);
            if (this.get("type") === "LineString") {
                this.setUnit("m");
            }
            else {
                this.setUnit("m²");
            }
        },

        setUnit: function (value) {
            this.set("unit", value);
        },

        setDecimal: function (value) {
            this.set("decimal", parseInt(value, 10));
        },

        /**
         * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
         */
        deleteFeatures: function () {
            // lösche alle Geometrien
            this.get("source").clear();
            // lösche alle Overlays (Tooltips)
            _.each(this.get("measureTooltips"), function (tooltip) {
                Radio.trigger("Map", "removeOverlay", tooltip, "measure");
            });
            this.set("measureTooltips", []);
        },
        setScale: function (options) {
            this.set("scale", options.scale);
        },

        /** Berechnet den Maßstabsabhängigen Fehler bei einer Standardabweichung von 1mm
        * @param {number} scale - Maßstabszahl
        */
        getScaleError: function (scale) {
            var scaleError = 0;

            switch (scale) {
                case 500: {
                    scaleError = 0.5;
                    break;
                }
                case 1000: {
                    scaleError = 1;
                    break;
                }
                case 2500: {
                    scaleError = 2.5;
                    break;
                }
                case 5000: {
                    scaleError = 5;
                    break;
                }
                case 10000: {
                    scaleError = 10;
                    break;
                }
                case 20000: {
                    scaleError = 20;
                    break;
                }
                case 40000: {
                    scaleError = 40;
                    break;
                }
                case 60000: {
                    scaleError = 60;
                    break;
                }
                case 100000: {
                    scaleError = 100;
                    break;
                }
                case 250000: {
                    scaleError = 250;
                    break;
                }
            }
            return scaleError;
        },

        /** Berechnet das Quadrat der deltas (für x und y) von zwei Koordinaten
        * @param {Array[n][2]} coordinates - Koordinatenliste der Geometrie
        * @param {number} pos0 - 1. Koordinate
        * @param {number} pos1 - 2. Koordinate
        */
        calcDeltaPow: function (coordinates, pos0, pos1) {
            var dx = coordinates[pos0][0] - coordinates[pos1][0],
            dy = coordinates[pos0][1] - coordinates[pos1][1],
            deltaPow = (Math.pow(dx, 2) + Math.pow(dy, 2));

            return deltaPow;
        },

        /**
         * Berechnet die Länge der Strecke.
         * @param {ol.geom.LineString} line - Linestring geometry
         */
        formatLength: function (line) {
            var length = line.getLength(),
                output,
                coords = line.getCoordinates(),
                rechtswertMittel = 0,
                lengthRed,
                fehler = 0,
                scale = parseInt(this.get("scale"), 10),
                scaleError = this.getScaleError(scale);

            for (var i = 0; i < coords.length; i++) {
                rechtswertMittel += coords[i][0];
                if (i < coords.length - 1) {
                    // http://www.physik.uni-erlangen.de/lehre/daten/NebenfachPraktikum/Anleitung%20zur%20Fehlerrechnung.pdf
                    // Seite 5:
                    fehler += Math.pow(scaleError, 2);
                }
            }
            fehler = Math.sqrt(fehler);
            rechtswertMittel = (rechtswertMittel / coords.length) / 1000;
            lengthRed = length - (0.9996 * length * (Math.pow(rechtswertMittel - 500, 2) / (2 * Math.pow(6381, 2))) - (0.0004 * length));

            if (this.get("unit") === "km") {
                 output = (lengthRed / 1000).toFixed(3) + " " + this.get("unit") + " <sub>(+/- " + (fehler / 1000).toFixed(3) + " " + this.get("unit") + ")</sub>";
            }
            else {
                output = lengthRed.toFixed(2) + " " + this.get("unit") + " <sub>(+/- " + fehler.toFixed(2) + " " + this.get("unit") + ")</sub>";
            }
            return output;
        },

        /**
         * Berechnet die Größe der Fläche.
         * @param {ol.geom.Polygon} polygon - Polygon geometry
         */
        formatArea: function (polygon) {
            var area = polygon.getArea(),
                output,
                coords = polygon.getLinearRing(0).getCoordinates(),
                rechtswertMittel = 0,
                areaRed,
                fehler = 0,
                scale = parseInt(this.get("scale"), 10),
                scaleError = this.getScaleError(scale);

            for (var i = 0;i < coords.length;i++) {
                rechtswertMittel += parseInt(coords[i][0], 10);
                if (i === coords.length - 1) {
                    fehler += this.calcDeltaPow(coords, i, 0);
                }
                else {
                    fehler += this.calcDeltaPow(coords, i, i + 1);
                }
            }
            fehler = 0.5 * scaleError * Math.sqrt(fehler);
            rechtswertMittel = (rechtswertMittel / coords.length) / 1000;
            areaRed = area - (Math.pow(0.9996, 2) * area * (Math.pow(rechtswertMittel - 500, 2) / Math.pow(6381, 2)) - (0.0008 * area));
            if (this.get("unit") === "km<sup>2</sup>") {
                output = (areaRed / 1000000).toFixed(2) + " " + this.get("unit") + " <sub>(+/- " + (fehler / 1000000).toFixed(2) + " " + this.get("unit") + ")</sub>";
            }
            else {
                 output = areaRed.toFixed(0) + " " + this.get("unit") + " <sub>(+/- " + fehler.toFixed(0) + " " + this.get("unit") + ")</sub>";
            }
            return output;
        }
    });

    return Measure;
});
