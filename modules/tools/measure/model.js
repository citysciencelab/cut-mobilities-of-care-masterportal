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
        glyphicon: "glyphicon-resize-full"
    }),

    initialize: function () {
        var channel = Radio.channel("Measure");

        channel.on({
            "placeMeasureTooltip": this.placeMeasureTooltip
        }, this);

        this.superInitialize();

        this.listenTo(this, {
            "change:geomtype": this.createInteraction,
            "change:isActive": this.setStatus
        });

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
        var that = this;

        Radio.trigger("Map", "removeInteraction", this.get("draw"));
        this.setDraw(new Draw({
            source: this.get("source"),
            type: this.get("geomtype"),
            style: this.get("style")
        }));
        this.get("draw").on("drawend", function (evt) {
            that.generateTextPoint(evt);
            evt.feature.set("styleId", evt.feature.ol_uid);
        }, this);
        Radio.trigger("Map", "addInteraction", this.get("draw"));
    },
    generateTextPoint: function (evt) {
        var geom = evt.feature.getGeometry(),
            output,
            coord,
            pointFeature,
            fill = new Fill({
                color: [0, 0, 0, 1]
            }),
            stroke = new Stroke({
                color: [255, 127, 0, 1],
                width: 1
            }),
            backgroundFill = new Fill({
                color: [255, 127, 0, 1]
            });

        if (geom instanceof Polygon) {
            output = this.formatArea(geom);
            coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
        }
        else if (geom instanceof LineString) {
            output = this.formatLength(geom);
            coord = geom.getLastCoordinate();
        }
        pointFeature = new Feature({
            geometry: new Point(coord)
        });
        pointFeature.setStyle([
            new Style({
                text: new Text({
                    text: output.measure,
                    textAlign: "left",
                    font: "14px sans-serif",
                    fill: fill,
                    stroke: stroke,
                    offsetY: -10,
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
                    backgroundFill: backgroundFill,
                    padding: [5, 0, 5, 0]
                })
            })
        ]);
        pointFeature.set("output", output);
        pointFeature.set("styleId", _.uniqueId());
        this.get("layer").getSource().addFeatures([pointFeature]);
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
        // lösche alle Overlays (Tooltips)
        // _.each(this.get("measureTooltips"), function (tooltip) {
        //     Radio.trigger("Map", "removeOverlay", tooltip, "measure");
        // });
        // this.set("measureTooltips", []);
    },
    setScale: function (options) {
        this.set("scale", options.scale);
    },

    /** Berechnet den Maßstabsabhängigen Fehler bei einer Standardabweichung von 1mm
    * @param {number} scale - Maßstabszahl
    * @return {undefined}
    */
    getScaleError: function (scale) {
        var scaleError;

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
            default: {
                scaleError = 0;
                break;
            }
        }
        return scaleError;
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
            scale = parseInt(this.get("scale"), 10),
            scaleError = this.getScaleError(scale),
            i;

        console.log(scale);
        console.log(scaleError);
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
            // output = (lengthRed / 1000).toFixed(3) + " " + this.get("unit") + " <sub>(+/- " + (fehler / 1000).toFixed(3) + " " + this.get("unit") + ")</sub>";
            output.measure = (lengthRed / 1000).toFixed(3) + " " + this.get("unit");
            output.deviance = "(+/- " + (fehler / 1000).toFixed(3) + " " + this.get("unit") + ")";
        }
        else {
            // output = lengthRed.toFixed(2) + " " + this.get("unit") + " <sub>(+/- " + fehler.toFixed(2) + " " + this.get("unit") + ")</sub>";
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
            scale = parseInt(this.get("scale"), 10),
            scaleError = this.getScaleError(scale),
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
            if (this.get("unit") === "km<sup>2</sup>") {
                output = (areaRed / 1000000).toFixed(1) + " " + this.get("unit") + " </br><span class='measure-hint'> Abschließen mit Doppelclick </span>";
            }
            else {
                output = areaRed.toFixed(0) + " " + this.get("unit") + " </br><span class='measure-hint'> Abschließen mit Doppelclick </span>";
            }
        }
        else if (this.get("unit") === "km<sup>2</sup>") {
            // output = (areaRed / 1000000).toFixed(2) + " " + this.get("unit") + " <sub>(+/- " + (fehler / 1000000).toFixed(2) + " " + this.get("unit") + ")</sub>";
            output.measure = (areaRed / 1000000).toFixed(2) + " " + this.get("unit");
            output.deviance = "(+/- " + (fehler / 1000000).toFixed(2) + " " + this.get("unit") + ")";
        }
        else {
            // output = areaRed.toFixed(0) + " " + this.get("unit") + " <sub>(+/- " + fehler.toFixed(0) + " " + this.get("unit") + ")</sub>";
            output.measure = areaRed.toFixed(0) + " " + this.get("unit");
            output.deviance = "(+/- " + fehler.toFixed(0) + " " + this.get("unit") + ")";
        }
        return output;
    },
    setDraw: function (value) {
        this.set("draw", value);
    }
});

export default Measure;
