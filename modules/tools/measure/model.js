import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Draw} from "ol/interaction.js";
import {Polygon, LineString} from "ol/geom.js";
import Tool from "../../core/modelList/tool/model";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import MultiPoint from "ol/geom/MultiPoint.js";

const Measure = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        source: new VectorSource(),
        style: [
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

                    _.each(geom.getCoordinates(), function (coordinate, index) {
                        if (index > 0 && index < geom.getCoordinates().length - 1) {
                            coords.push(coordinate);
                        }
                    });

                    return new MultiPoint(coords);
                }
            })
        ],
        geomtype: "LineString",
        unit: "m",
        decimal: 1,
        uiStyle: "DEFAULT",
        quickHelp: false,
        renderToWindow: true,
        deactivateGFI: true,
        pointerMoveListener: {},
        clickListener: {},
        textPoint: {},
        scale: -1
    }),

    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:geomtype": this.createInteraction,
            "change:isActive": this.setStatus
        });
        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": function (options) {
                this.setScale(options.scale);
            }
        }, this);

        this.set("layer", new VectorLayer({
            source: this.get("source"),
            style: this.get("style"),
            name: "measure_layer",
            alwaysOnTop: true
        }));

        this.setUiStyle(Radio.request("Util", "getUiStyle"));
    },
    setStatus: function (model, value) {
        var layers = Radio.request("Map", "getLayers"),
            measureLayer;

        if (value) {
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
        }
    },

    createInteraction: function () {
        var that = this,
            textPoint;

        Radio.trigger("Map", "removeInteraction", this.get("draw"));
        this.setDraw(new Draw({
            source: this.get("source"),
            type: this.get("geomtype"),
            style: this.get("style")
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
    generateTextStyles: function (feature) {
        var geom = feature.getGeometry(),
            output,
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
                    font: "10px sans-serif",
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
    generateTextPoint: function (feature) {
        var geom = feature.getGeometry(),
            coord,
            pointFeature;

        if (geom instanceof Polygon) {
            coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
        }
        else if (geom instanceof LineString) {
            coord = geom.getLastCoordinate();
        }
        pointFeature = new Feature({
            geometry: new Point(coord)
        });
        pointFeature.setStyle(this.generateTextStyles(feature));
        pointFeature.set("styleId", _.uniqueId());
        return pointFeature;
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
                output = (lengthRed / 1000).toFixed(1) + " " + this.get("unit") + " </br><span class='measure-hint'> Abschließen mit Doppelclick </span>";
            }
            else {
                output = lengthRed.toFixed(0) + " " + this.get("unit") + " </br><span class='measure-hint'> Abschließen mit Doppelclick </span>";
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
                output = (areaRed / 1000000).toFixed(1) + " " + this.get("unit") + " </br><span class='measure-hint'> Abschließen mit Doppelclick </span>";
            }
            else {
                output = areaRed.toFixed(0) + " " + this.get("unit") + " </br><span class='measure-hint'> Abschließen mit Doppelclick </span>";
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
    }
});

export default Measure;
