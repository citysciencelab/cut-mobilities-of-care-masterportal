import {Circle, Fill, Stroke, Style} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Draw} from "ol/interaction.js";
import Overlay from "ol/Overlay.js";
import {Polygon, LineString} from "ol/geom.js";
import Tool from "../../core/modelList/tool/model";

const Measure = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        source: new VectorSource(),
        style: new Style({
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
        geomtype: "LineString",
        unit: "m",
        decimal: 1,
        measureTooltips: [],
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
        this.set("draw", new Draw({
            source: this.get("source"),
            type: this.get("geomtype"),
            style: this.get("style")
        }));
        this.get("draw").on("drawstart", function (evt) {
            Radio.trigger("Map", "registerListener", "pointermove", that.placeMeasureTooltip.bind(that), this);
            // "click" needed for touch devices
            Radio.trigger("Map", "registerListener", "click", that.placeMeasureTooltip.bind(that), this);
            that.set("sketch", evt.feature);
            that.createMeasureTooltip();
        }, this);
        this.get("draw").on("drawend", function (evt) {
            evt.feature.set("styleId", evt.feature.ol_uid);
            that.get("measureTooltipElement").className = "tooltip-default tooltip-static";
            that.get("measureTooltip").setOffset([0, -7]);
            // unset sketch
            that.set("sketch", null);
            // unset tooltip so that a new one can be created
            that.set("measureTooltipElement", null);
            Radio.trigger("Map", "unregisterListener", "pointermove", that.placeMeasureTooltip.bind(that), this);
            // "click" needed for touch devices
            Radio.trigger("Map", "unregisterListener", "click", that.placeMeasureTooltip.bind(that), this);
        }, this);
        Radio.trigger("Map", "addInteraction", this.get("draw"));
    },

    createMeasureTooltip: function () {
        var measureTooltipElement,
            measureTooltip;

        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement("div");
        measureTooltipElement.className = "tooltip-default tooltip-measure";
        measureTooltip = new Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: "bottom-center"
        });
        this.set("measureTooltipElement", measureTooltipElement);
        this.set("measureTooltip", measureTooltip);
        Radio.trigger("Map", "addOverlay", measureTooltip, "measure");
        this.get("measureTooltips").push(measureTooltip);
    },

    placeMeasureTooltip: function () {
        var output, geom, coord;

        // if (evt.dragging) {
        //     return;
        // }

        if (this.get("measureTooltips").length > 0) {
            this.setScale(Radio.request("MapView", "getOptions"));

            if (this.get("sketch")) {
                geom = this.get("sketch").getGeometry();

                if (geom instanceof Polygon) {
                    output = this.formatArea(geom);
                    coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
                }
                else if (geom instanceof LineString) {
                    output = this.formatLength(geom);
                    coord = geom.getLastCoordinate();
                }
                this.get("measureTooltipElement").innerHTML = output;
                this.get("measureTooltip").setPosition(coord);
            }
        }
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
            output,
            coords = line.getCoordinates(),
            rechtswertMittel = 0,
            lengthRed,
            fehler = 0,
            scale = parseInt(this.get("scale"), 10),
            scaleError = this.getScaleError(scale),
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
     * @return {undefined}
     */
    formatArea: function (polygon) {
        var area = polygon.getArea(),
            output,
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
            output = (areaRed / 1000000).toFixed(2) + " " + this.get("unit") + " <sub>(+/- " + (fehler / 1000000).toFixed(2) + " " + this.get("unit") + ")</sub>";
        }
        else {
            output = areaRed.toFixed(0) + " " + this.get("unit") + " <sub>(+/- " + fehler.toFixed(0) + " " + this.get("unit") + ")</sub>";
        }
        return output;
    }
});

export default Measure;
