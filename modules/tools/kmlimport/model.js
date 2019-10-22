import proj4 from "proj4";
import Tool from "../../core/modelList/tool/model";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import {KML} from "ol/format.js";

const ImportTool = Tool.extend(/** @lends ImportTool.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        text: "",
        features: [],
        format: new KML({extractStyles: true}),
        renderToWindow: true,
        glyphicon: "glyphicon-import"
    }),

    /**
     * @class ImportTool
     * @description The ImportTool is a tool for importing data in kml format.
     * @extends Tool
     * @memberof Tools.Kmlimport
     * @constructs
     * @property {String} text="" todo
     * @property {Array} features=[] todo
     * @property {ol/format} format=new KML({extractStyles: true}) todo
     * @property {Boolean} renderToWindow=true todo
     * @property {String} glyphicon="glyphicon-import" todo
     * @listens Tools.Kmlimport#ChangeIsActive
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     */
    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                var drawLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");

                if (value && this.get("layer") === undefined) {
                    this.set("layer", drawLayer);
                    this.set("source", drawLayer.getSource());
                }
            }
        });
    },

    /**
     * Controls the kml import.
     * @returns {void}
     */
    importKML: function () {
        this.getFeaturesFromKML();
        this.transformFeatures();
        this.styleFeatures(this.get("features"));
        this.featuresToMap();
        this.emptyInput();

    },

    /**
     * After import:kml empty input and reset button-style.
     * @returns {void}
     */
    emptyInput: function () {
        $("#fakebutton").html("Datei auswählen (keine ausgewählt)");
        if (this.get("text") !== "") {
            this.setText("");
            $("#fakebutton").toggleClass("btn-primary");
            $("#btn_import").prop("disabled", true);
        }
    },

    /**
     * Read features from KML (stored in "text").
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    getFeaturesFromKML: function () {
        var features;

        if (this.get("text") !== "") {
            features = this.get("format").readFeatures(this.get("text"));

            this.setFormat(this.get("format"));
            this.setFeatures(features);
        }
        else {
            Radio.trigger("Alert", "alert", "Bitte wählen Sie zuerst eine KML-Datei zum Importieren aus");
        }
    },

    /**
     * Sets the style to a feature.
     * @param {ol/features} features features to be drawn
     * @returns {void}
     */
    styleFeatures: function (features) {
        const styleObjects = this.parseStyleFromKML(features, this.get("text"));

        features.forEach((feature, index) => {
            const drawGeometryType = feature.getGeometry().getType(),
                fontText = feature.get("name");
            let style;

            if (drawGeometryType === "Point" && fontText !== undefined) {
                styleObjects[index].labelStyle.color = this.convertHexColorToRgbArray(styleObjects[index].labelStyle.color);
                style = this.getTextStyle(fontText, styleObjects[index]);
            }
            else {
                styleObjects[index].lineStyle.color = this.convertHexColorToRgbArray(styleObjects[index].lineStyle.color);

                styleObjects[index].lineStyle.width = Number.isNaN(styleObjects[index].lineStyle.width) ? 1 : styleObjects[index].lineStyle.width;
                styleObjects[index].polyStyle.color = styleObjects[index].polyStyle.color.length < 6
                    ? styleObjects[index].lineStyle.color : this.convertHexColorToRgbArray(styleObjects[index].polyStyle.color);

                style = this.createDrawStyle(drawGeometryType, styleObjects[index]);
            }

            feature.setStyle(style);
        });
    },

    /**
     * Parse the style from the given kml data.
     * @param {ol/features} features features to be drawn
     * @param {XML} kmlText features with style in kml-format
     * @returns {Object} parsed Styles
     */
    parseStyleFromKML: function (features, kmlText) {
        const kml = $.parseXML(kmlText),
            placemarks = $("Placemark", kml),
            styleObjects = [];

        Array.from(placemarks).forEach(node => {
            const style = $("Style", node),
                lineStyle = $("LineStyle", style),
                polyStyle = $("PolyStyle", style),
                pointStyle = $("pointstyle", style),
                labelStyle = $("LabelStyle", style),
                styleObject = {
                    name: $(node).find("name").text(),
                    style: style,
                    lineStyle: {
                        color: $(lineStyle).find("color").text(),
                        width: parseInt($(lineStyle).find("width").text(), 10)
                    },
                    polyStyle: {
                        color: $(polyStyle).find("color").text()
                    },
                    pointStyle: {
                        radius: parseInt($(pointStyle).find("radius").text(), 10)
                    },
                    labelStyle: {
                        color: $(labelStyle).find("color").text(),
                        font: $(labelStyle).find("font").text()
                    }
                };

            styleObjects.push(styleObject);
        });

        return styleObjects;
    },

    /**
     * Converts a reverse given hexColor with opacity such as "ffaa30bb" to an array with RGBA-values.
     * @param {String} hexColor a color in hexadecimal
     * @returns {String[]} values in RGBA
     */
    convertHexColorToRgbArray: function (hexColor) {
        const hexColor8 = hexColor.length === 6 ? "FF" + hexColor : hexColor;
        let colorRgbArray = [];

        colorRgbArray = hexColor8.match(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        colorRgbArray = colorRgbArray.splice(1, 4);
        colorRgbArray = colorRgbArray.map(hexValue => parseInt(hexValue, 16));
        colorRgbArray[0] = Math.round(colorRgbArray[0] / 255 * 100) / 100;

        return colorRgbArray.reverse();
    },

    /**
     * Creates a style for text.
     * @param {String} fontText font for the text
     * @param {Object} styleObject parsed Styles
     * @returns {ol/style} style for text
     */
    getTextStyle: function (fontText, styleObject) {
        return new Style({
            text: new Text({
                text: fontText,
                textAlign: "left",
                font: styleObject.labelStyle.font,
                fill: new Fill({
                    color: styleObject.labelStyle.color
                })
            })
        });
    },

    /**
     * Creates a style for a feature with a given gemetry.
     * @param {String} drawGeometryType geometrie of feature
     * @param {Object} styleObject parsed Styles
     * @returns {ol/style} style for a feature with geometry
     */
    createDrawStyle: function (drawGeometryType, styleObject) {
        return new Style({
            fill: new Fill({
                color: styleObject.polyStyle.color
            }),
            stroke: new Stroke({
                color: styleObject.lineStyle.color,
                width: styleObject.lineStyle.width
            }),
            image: new Circle({
                radius: drawGeometryType === "Point" ? styleObject.pointStyle.radius : 6,
                fill: new Fill({
                    color: styleObject.polyStyle.color
                })
            })
        });
    },

    /**
     * Transform the coordinate system of features.
     * @returns {void}
     */
    transformFeatures: function () {
        var features = this.get("features");

        _.each(features, function (feature) {
            var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:4326", "EPSG:25832"));

            feature.getGeometry().setCoordinates(transCoord, "XY");
        }, this);
        this.setFeatures(features);
    },

    /**
     * todo
     * @param {*} sourceProj todo
     * @param {*} destProj todo
     * @returns {Object} todo
     */
    getProjections: function (sourceProj, destProj) {
        return {
            sourceProj: proj4(sourceProj),
            destProj: proj4(destProj)
        };
    },

    /**
     * Transforms the coordinates taking the geometry into account.
     * @param {String} geometry geoemtzry of a feature
     * @param {*} projections todo
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {Array} todo
     */
    transformCoords: function (geometry, projections) {
        var transCoord = [];

        switch (geometry.getType()) {
            case "Polygon": {
                transCoord = this.transformPolygon(geometry.getCoordinates(), projections, this);
                break;
            }
            case "Point": {
                transCoord = this.transformPoint(geometry.getCoordinates(), projections);
                break;
            }
            case "LineString": {
                transCoord = this.transformLine(geometry.getCoordinates(), projections, this);
                break;
            }
            default: {
                Radio.trigger("Alert", "alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
            }
        }
        return transCoord;
    },

    /**
     * todo
     * @param {*} coords todo
     * @param {*} projections todo
     * @param {*} context todo
     * @returns {*} todo
     */
    transformPolygon: function (coords, projections, context) {
        var transCoord = [];

        // multiple Points
        _.each(coords, function (points) {
            _.each(points, function (point) {
                transCoord.push(context.transformPoint(point, projections));
            });
        }, this);
        return [transCoord];
    },

    /**
     * todo
     * @param {*} coords todo
     * @param {*} projections todo
     * @param {*} context todo
     * @returns {*} todo
     */
    transformLine: function (coords, projections, context) {
        var transCoord = [];

        // multiple Points
        _.each(coords, function (point) {
            transCoord.push(context.transformPoint(point, projections));
        }, this);
        return transCoord;
    },

    /**
     * todo
     * @param {*} point todo
     * @param {*} projections todo
     * @returns {*} todo
     */
    transformPoint: function (point, projections) {
        point.pop();
        return proj4(projections.sourceProj, projections.destProj, point);
    },

    /**
     * Loads features into the map
     * @returns {void}
     */
    featuresToMap: function () {
        var features = this.get("features"),
            source = this.get("source");

        source.addFeatures(features);
    },

    /**
     * sets the text
     * @param {*} value todo
     * @returns {void}
     */
    setText: function (value) {
        this.set("text", value);
    },

    /**
     * sets the features
     * @param {*} value todo
     * @returns {void}
     */
    setFeatures: function (value) {
        this.set("features", value);
    },

    /**
     * sets the source
     * @param {*} value todo
     * @returns {void}
     */
    setSource: function (value) {
        this.set("source", value);
    },

    /**
     * sets the layer
     * @param {*} value todo
     * @returns {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * sets the format
     * @param {*} value todo
     * @returns {void}
     */
    setFormat: function (value) {
        this.set("format", value);
    }
});

export default ImportTool;
