import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Draw} from "ol/interaction.js";
import {Polygon, LineString, Point, MultiPoint} from "ol/geom.js";
import Tool from "../../core/modelList/tool/model";
import * as Proj from "ol/proj.js";
import Feature from "ol/Feature.js";

const Measure = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        source: new VectorSource(),
        styles: [
            // general style
            new Style({
                fill: new Fill({
                    color: [255, 127, 0, 0.3]
                }),
                stroke: new Stroke({
                    color: [255, 127, 0, 1.0],
                    width: 2
                }),
                image: new Circle({
                    radius: 6,
                    stroke: new Stroke({
                        color: [255, 127, 0, 1.0],
                        width: 3
                    }),
                    fill: new Fill({
                        color: [255, 127, 0, 0.4]
                    })
                })
            }),
            //  style for first and last coord
            new Style({
                image: new Circle({
                    radius: 6,
                    stroke: new Stroke({
                        color: [255, 127, 0, 1.0],
                        width: 3
                    }),
                    fill: new Fill({
                        color: [255, 127, 0, 0.4]
                    })
                }),
                geometry: function (feature) {
                    var geom = feature.getGeometry(),
                        coords = [];

                    coords.push(geom.getFirstCoordinate());
                    coords.push(geom.getLastCoordinate());
                    return new MultiPoint(coords);
                }
            }),
            // style for all points except first and last
            new Style({
                image: new Circle({
                    radius: 2,
                    stroke: new Stroke({
                        color: [255, 127, 0, 1.0],
                        width: 3
                    }),
                    fill: new Fill({
                        color: [255, 127, 0, 0.4]
                    })
                }),
                geometry: function (feature) {
                    var geom = feature.getGeometry(),
                        coords = [];

                    if (geom instanceof LineString) {
                        _.each(geom.getCoordinates(), function (coordinate, index) {
                            if (index > 0 && index < geom.getCoordinates().length - 1) {
                                coords.push(coordinate);
                            }
                        });
                    }
                    if (geom instanceof Polygon) {
                        _.each(geom.getCoordinates()[0], function (coordinate, index) {
                            if (index > 0 && index < geom.getCoordinates()[0].length - 1) {
                                coords.push(coordinate);
                            }
                        });
                    }

                    return new MultiPoint(coords);
                }
            })
        ],
        geomtype: "LineString",
        unit: "m",
        decimal: 1,
        hits3d: [],
        quickHelp: false,
        isMap3d: false,
        uiStyle: "DEFAULT",
        renderToWindow: true,
        deactivateGFI: true,
        pointerMoveListener: {},
        clickListener: {},
        textPoint: {},
        scale: -1,
        "glyphicon": "glyphicon-resize-full"
    }),

    initialize: function () {
        this.superInitialize();

        this.listenTo(Radio.channel("Map"), {
            "change": this.changeMap
        });

        this.listenTo(this, {
            "change:geomtype": function () {
                if (this.get("isActive")) {
                    this.createInteraction();
                }
            },
            "change:isActive": this.setStatus
        });
        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": function (options) {
                this.setScale(options.scale);
            }
        }, this);

        this.set("layer", new VectorLayer({
            source: this.get("source"),
            style: this.get("styles"),
            name: "measure_layer",
            alwaysOnTop: true
        }));
    },
    setStatus: function (model, value) {
        var layers = Radio.request("Map", "getLayers"),
            quickHelpSet = Radio.request("Quickhelp", "isSet") === true ? true : false,
            measureLayer;

        if (value) {
            this.setQuickHelp(quickHelpSet);
            this.setUiStyle(Radio.request("Util", "getUiStyle"));
            this.setScale(Radio.request("MapView", "getOptions").scale);
            measureLayer = _.find(layers.getArray(), function (layer) {
                return layer.get("name") === "measure_layer";
            });
            if (measureLayer === undefined) {
                Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), layers.getArray().length]);
            }
            this.createInteraction();

        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("draw"));
            this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
        }
    },
    changeMap: function (map) {
        this.deleteFeatures();
        if (map === "3D") {
            this.set("isMap3d", true);
            this.set("geomtype", "3d");
        }
        else {
            this.set("isMap3d", false);
            this.set("geomtype", "LineString");
        }
        if (this.get("isActive")) {
            this.createInteraction();
        }
    },
    handle3DClicked: function (obj) {
        var scene = Radio.request("Map", "getMap3d").getCesiumScene(),
            object = scene.pick(obj.position),
            hit,
            cartographic,
            ray,
            coords,
            mapProjection = Radio.request("MapView", "getProjection"),
            hits3d = this.get("hits3d"),
            firstHit = hits3d[0],
            pointId = "__3dMeasurmentFirstPoint",
            source = this.get("source"),
            lon,
            lat,
            feature,
            distance,
            textPoint,
            heightDiff,
            firstPoint;

        if (object) {
            hit = scene.pickPosition(obj.position);
            cartographic = scene.globe.ellipsoid.cartesianToCartographic(hit);
        }
        else {
            ray = scene.camera.getPickRay(obj.position);
            hit = scene.globe.pick(ray, scene);
            cartographic = scene.globe.ellipsoid.cartesianToCartographic(hit);
            cartographic.height = scene.globe.getHeight(cartographic);
        }
        lon = Cesium.Math.toDegrees(cartographic.longitude);
        lat = Cesium.Math.toDegrees(cartographic.latitude);
        coords = [lon, lat, cartographic.height];
        coords = Proj.transform(coords, Proj.get("EPSG:4326"), mapProjection);
        // draw first point
        if (hits3d.length === 0) {
            feature = this.createPointFeature(coords, pointId);

            source.addFeature(feature);
            hits3d.push({
                cartesian: hit,
                coords: coords
            });
        }
        // draw second point as Line and remove first drawn point
        else {
            distance = Cesium.Cartesian3.distance(firstHit.cartesian, hit);
            heightDiff = Math.abs(coords[2] - firstHit.coords[2]);
            feature = this.createLineFeature(firstHit.coords, coords);
            source.addFeature(feature);
            textPoint = this.generateTextPoint(feature, distance, heightDiff, coords);
            source.addFeature(textPoint);
            this.setTextPoint(textPoint);
            this.set("hits3d", []);

            firstPoint = source.getFeatureById(pointId);
            source.removeFeature(firstPoint);
        }
    },
    createPointFeature: function (coords, id) {
        var feature = new Feature({
            geometry: new Point(coords)
        });

        feature.setId(id);

        return feature;
    },
    createLineFeature: function (firstCoord, lastCoord) {
        var feature = new Feature({
            geometry: new LineString([
                firstCoord,
                lastCoord
            ])
        });

        return feature;
    },
    createInteraction: function () {
        var that = this,
            textPoint;

        Radio.trigger("Map", "removeInteraction", this.get("draw"));
        this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
        if (Radio.request("Map", "isMap3d")) {
            this.listenTo(Radio.channel("Map"), "clickedWindowPosition", this.handle3DClicked.bind(this));
            this.set("hits3d", []);
        }
        else {
            this.setDraw(new Draw({
                source: this.get("source"),
                type: this.get("geomtype"),
                style: this.get("styles")
            }));
            this.get("draw").on("drawstart", function (evt) {
                textPoint = that.generateTextPoint(evt.feature);
                that.get("layer").getSource().addFeatures([textPoint]);
                that.setTextPoint(textPoint);
                that.registerPointerMoveListener(that);
                that.registerClickListener(that);
            }, this);
            this.get("draw").on("drawend", function (evt) {
                evt.feature.set("styleId", evt.feature.ol_uid);
                that.unregisterPointerMoveListener(that);
                that.unregisterClickListener(that);
            }, this);
            Radio.trigger("Map", "addInteraction", this.get("draw"));
        }
    },
    registerPointerMoveListener: function (context) {
        context.setPointerMoveListener(Radio.request("Map", "registerListener", "pointermove", context.moveTextPoint.bind(context)));
    },
    registerClickListener: function (context) {
        // "click" needed for touch devices
        context.setClickListener(Radio.request("Map", "registerListener", "click", context.moveTextPoint.bind(context)));
    },
    unregisterPointerMoveListener: function (context) {
        Radio.trigger("Map", "unregisterListener", context.get("pointerMoveListener"));
    },
    unregisterClickListener: function (context) {
        Radio.trigger("Map", "unregisterListener", context.get("clickListener"));
    },
    moveTextPoint: function (evt) {
        var point = this.get("textPoint"),
            geom = point.getGeometry(),
            currentLine = this.get("draw").getOverlay().getSource().getFeatures()[0],
            styles = this.generateTextStyles(currentLine);

        geom.setCoordinates(evt.coordinate);
        point.setStyle(styles);
    },
    generate3dTextStyles: function (distance, heightDiff) {
        var output = {},
            fill = new Fill({
                color: [255, 255, 255, 1]
            }),
            stroke = new Stroke({
                color: [0, 0, 0, 1],
                width: 2
            }),
            styles = [];

        if (this.get("unit") === "km") {
            output.measure = "Länge: " + (distance / 1000).toFixed(3) + this.get("unit");
        }
        else {
            output.measure = "Länge: " + distance.toFixed(2) + this.get("unit");
        }
        output.deviance = " Höhe: " + heightDiff.toFixed(2) + "m";

        styles = [
            new Style({
                text: new Text({
                    text: output.measure,
                    textAlign: "left",
                    font: "18px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -50,
                    offsetX: 10
                })
            }),
            new Style({
                text: new Text({
                    text: output.deviance,
                    textAlign: "left",
                    font: "18px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -30,
                    offsetX: 10
                })
            })
        ];
        return styles;
    },
    generateTextStyles: function (feature) {
        var geom = feature.getGeometry(),
            output = {},
            fill = new Fill({
                color: [0, 0, 0, 1]
            }),
            stroke = new Stroke({
                color: [255, 127, 0, 1],
                width: 1
            }),
            backgroundFill = new Fill({
                color: [255, 127, 0, 1]
            }),
            styles = [];

        if (geom instanceof Polygon) {
            output = this.formatArea(geom);
        }
        else if (geom instanceof LineString) {
            output = this.formatLength(geom);
        }

        styles = [
            new Style({
                text: new Text({
                    text: output.measure,
                    textAlign: "left",
                    font: "14px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -10,
                    offsetX: 10,
                    backgroundFill: backgroundFill,
                    padding: [5, 0, 5, 0]
                })
            }),
            new Style({
                text: new Text({
                    text: output.deviance,
                    textAlign: "left",
                    font: "12px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: 10,
                    offsetX: 10,
                    backgroundFill: backgroundFill,
                    padding: [5, 0, 5, 0]
                })
            })
        ];
        return styles;
    },
    generateTextPoint: function (feature, distance, heightDiff, coords) {
        var geom = feature.getGeometry(),
            coord,
            pointFeature;

        if (distance !== undefined) {
            coord = coords;
        }
        else if (geom instanceof Polygon) {
            coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
        }
        else if (geom instanceof LineString) {
            coord = geom.getLastCoordinate();
        }
        pointFeature = new Feature({
            geometry: new Point(coord)
        });
        if (distance !== undefined) {
            pointFeature.setStyle(this.generate3dTextStyles(distance, heightDiff));
        }
        else {
            pointFeature.setStyle(this.generateTextStyles(feature));
        }
        pointFeature.set("styleId", _.uniqueId());
        return pointFeature;
    },

    place3dMeasureTooltip: function (distance, heightDiff, position) {
        var output = "<span class='glyphicon glyphicon-resize-horizontal'/> ";

        if (this.get("unit") === "km") {
            output += (distance / 1000).toFixed(3) + " " + this.get("unit");
        }
        else {
            output += distance.toFixed(2) + " " + this.get("unit");
        }

        output += "<br><span class='glyphicon glyphicon-resize-vertical'/> ";
        output += heightDiff.toFixed(2) + " m";

        this.createMeasureTooltip();
        this.get("measureTooltipElement").innerHTML = output;
        this.get("measureTooltip").setPosition(position);
    },

    /**
     * Setzt den Typ der Geometrie (LineString oder Polygon).
     * @param {String} value - Typ der Geometrie
     * @return {undefined}
     */
    setGeometryType: function (value) {
        this.set("geomtype", value);
        if (this.get("geomtype") === "LineString") {
            this.setUnit("m");
        }
        else {
            this.setUnit("m²");
        }
    },

    setUnit: function (value) {
        this.set("unit", value);
    },

    setUiStyle: function (value) {
        this.set("uiStyle", value);
    },

    setDecimal: function (value) {
        this.set("decimal", parseInt(value, 10));
    },

    /**
     * Löscht alle Geometrien und die dazugehörigen MeasureTooltips.
     * @return {undefined}
     */
    deleteFeatures: function () {
        // lösche alle Geometrien
        this.get("source").clear();
    },

    /** Berechnet das Quadrat der deltas (für x und y) von zwei Koordinaten
    * @param {Array} coordinates - Koordinatenliste der Geometrie
    * @param {number} pos0 - 1. Koordinate
    * @param {number} pos1 - 2. Koordinate
    * @return {undefined}
    */
    calcDeltaPow: function (coordinates, pos0, pos1) {
        var dx = coordinates[pos0][0] - coordinates[pos1][0],
            dy = coordinates[pos0][1] - coordinates[pos1][1],
            deltaPow = Math.pow(dx, 2) + Math.pow(dy, 2);

        return deltaPow;
    },

    /**
     * Berechnet die Länge der Strecke.
     * @param {ol.geom.LineString} line - Linestring geometry
     * @return {undefined}
     */
    formatLength: function (line) {
        var length = line.getLength(),
            output = {},
            coords = line.getCoordinates(),
            rechtswertMittel = 0,
            lengthRed,
            fehler = 0,
            scaleError = this.get("scale") / 1000, // Berechnet den Maßstabsabhängigen Fehler bei einer Standardabweichung von 1mm
            i;

        for (i = 0; i < coords.length; i++) {
            rechtswertMittel += coords[i][0];
            if (i < coords.length - 1) {
                // http://www.physik.uni-erlangen.de/lehre/daten/NebenfachPraktikum/Anleitung%20zur%20Fehlerrechnung.pdf
                // Seite 5:
                fehler += Math.pow(scaleError, 2);
            }
        }
        fehler = Math.sqrt(fehler);
        rechtswertMittel = rechtswertMittel / coords.length / 1000;
        lengthRed = length - (0.9996 * length * (Math.pow(rechtswertMittel - 500, 2) / (2 * Math.pow(6381, 2)))) - (0.0004 * length);
        if (this.get("uiStyle") === "TABLE") {
            if (this.get("unit") === "km") {
                output.measure = (lengthRed / 1000).toFixed(1) + " " + this.get("unit");
                output.deviance = "Abschließen mit Doppelklick";
            }
            else {
                output.measure = lengthRed.toFixed(0) + " " + this.get("unit");
                output.deviance = "Abschließen mit Doppelklick";
            }
        }
        else if (this.get("unit") === "km") {
            output.measure = (lengthRed / 1000).toFixed(3) + " " + this.get("unit");
            output.deviance = "(+/- " + (fehler / 1000).toFixed(3) + " " + this.get("unit") + ")";
        }
        else {
            output.measure = lengthRed.toFixed(2) + " " + this.get("unit");
            output.deviance = "(+/- " + fehler.toFixed(2) + " " + this.get("unit") + ")";
        }
        return output;
    },

    /**
     * Berechnet die Größe der Fläche.
     * @param {ol.geom.Polygon} polygon - Polygon geometry
     * @return {undefined}
     */
    formatArea: function (polygon) {
        var area = polygon.getArea(),
            output = {},
            coords = polygon.getLinearRing(0).getCoordinates(),
            rechtswertMittel = 0,
            areaRed,
            fehler = 0,
            scaleError = this.get("scale") / 1000,
            i;

        for (i = 0; i < coords.length; i++) {
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
        areaRed = area - (Math.pow(0.9996, 2) * area * (Math.pow(rechtswertMittel - 500, 2) / Math.pow(6381, 2))) - (0.0008 * area);
        if (this.get("uiStyle") === "TABLE") {
            if (this.get("unit") === "km²") {
                output.measure = (areaRed / 1000000).toFixed(1) + " " + this.get("unit");
                output.deviance = "Abschließen mit Doppelklick";
            }
            else {
                output.measure = areaRed.toFixed(0) + " " + this.get("unit");
                output.deviance = "Abschließen mit Doppelclick";
            }
        }
        else if (this.get("unit") === "km²") {
            output.measure = (areaRed / 1000000).toFixed(2) + " " + this.get("unit");
            output.deviance = "(+/- " + (fehler / 1000000).toFixed(2) + " " + this.get("unit") + ")";
        }
        else {
            output.measure = areaRed.toFixed(0) + " " + this.get("unit");
            output.deviance = "(+/- " + fehler.toFixed(0) + " " + this.get("unit") + ")";
        }
        return output;
    },
    setDraw: function (value) {
        this.set("draw", value);
    },
    setPointerMoveListener: function (value) {
        this.set("pointerMoveListener", value);
    },
    setClickListener: function (value) {
        this.set("clickListener", value);
    },
    setTextPoint: function (value) {
        this.set("textPoint", value);
    },
    setScale: function (value) {
        this.set("scale", value);
    },

    /*
    * setter for quickHelp
    * @param {[type]} value quickHelp
    * @returns {void}
    */
    setQuickHelp: function (value) {
        this.set("quickHelp", value);
    }
});

export default Measure;
