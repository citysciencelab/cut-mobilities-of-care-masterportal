import proj4 from "proj4";
import Tool from "../../core/modelList/tool/model";
import {Circle, Fill, Stroke, Style, Text} from "ol/style.js";
import {KML} from "ol/format.js";

const ImportTool = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        text: "",
        features: [],
        format: new KML({extractStyles: true}),
        renderToWindow: true,
        glyphicon: "glyphicon-import"
    }),

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

    importKML: function () {
        this.getFeaturesFromKML();
        this.transformFeatures();
        this.styleFeatures(this.get("features"));
        this.featuresToMap();
        this.emptyInput();

    },

    // nach import:kml input leeren und button-style zurücksetzen
    emptyInput: function () {
        $("#fakebutton").html("Datei auswählen (keine ausgewählt)");
        if (this.get("text") !== "") {
            this.setText("");
            $("#fakebutton").toggleClass("btn-primary");
            $("#btn_import").prop("disabled", true);
        }
    },

    // features von KML (in "text" gespeichert) einlesen
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

    styleFeatures: function (features) {
        const styleObjects = this.parseStyleFromKML(features, this.get("text"));

        features.forEach((feature, index) => {
            const drawGeometryType = feature.getGeometry().getType(),
                fontText = feature.get("name");
            let style,
                colorAsArray;

            if (drawGeometryType === "Point" && fontText !== undefined) {
                colorAsArray = this.convertHexColorToRgbArray(styleObjects[index].labelStyle.color);
                style = this.getTextStyle(fontText, styleObjects[index], colorAsArray);
            }
            else {
                colorAsArray = this.convertHexColorToRgbArray(styleObjects[index].lineStyle.color);
                style = this.createDrawStyle(drawGeometryType, styleObjects[index], index, colorAsArray);
            }
            feature.setStyle(style);
        });
    },

    parseStyleFromKML: function (features, kmlText) {
        const kml = $.parseXML(kmlText),
            placemarks = $("Placemark", kml),
            styleObjects = [];

        Array.from(placemarks).forEach(node => {
            const style = $("Style", node),
                lineStyle = $("LineStyle", style),
                // polyStyle = $("PolyStyle", style),
                pointStyle = $("pointstyle", style),
                labelStyle = $("LabelStyle", style),
                styleObject = {
                    name: $(node).find("name").text(),
                    style: style,
                    lineStyle: {
                        color: $(lineStyle).find("color").text(),
                        width: $(lineStyle).find("width").text()
                    },
                    pointStyle: {
                        radius: $(pointStyle).find("radius").text()
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

    convertHexColorToRgbArray: function (hexColor) {
        let colorRgbArray = [];

        colorRgbArray = hexColor.match(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        colorRgbArray = colorRgbArray.splice(1, 4);
        colorRgbArray = colorRgbArray.map(hexValue => parseInt(hexValue, 16));
        colorRgbArray[0] = Math.round(colorRgbArray[0] / 255 * 100) / 100;

        return colorRgbArray.reverse();
    },

    getTextStyle: function (fontText, styleObject, color) {
        return new Style({
            text: new Text({
                text: fontText,
                textAlign: "left",
                font: styleObject.labelStyle.font,
                fill: new Fill({
                    color: color
                })
            })
        });
    },

    createDrawStyle: function (drawGeometryType, styleObject, zIndex, colorAsArray) {
        return new Style({
            fill: new Fill({
                color: colorAsArray
            }),
            stroke: new Stroke({
                color: colorAsArray,
                width: styleObject.lineStyle.width
            }),
            image: new Circle({
                radius: drawGeometryType === "Point" ? styleObject.pointStyle.radius : 6,
                fill: new Fill({
                    color: colorAsArray
                })
            }),
            zIndex: zIndex
        });
    },

    // Koordinatentransformation
    transformFeatures: function () {
        var features = this.get("features");

        _.each(features, function (feature) {
            var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:4326", "EPSG:25832"));

            feature.getGeometry().setCoordinates(transCoord, "XY");
        }, this);
        this.setFeatures(features);
    },

    getProjections: function (sourceProj, destProj) {
        return {
            sourceProj: proj4(sourceProj),
            destProj: proj4(destProj)
        };
    },

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

    transformLine: function (coords, projections, context) {
        var transCoord = [];

        // multiple Points
        _.each(coords, function (point) {
            transCoord.push(context.transformPoint(point, projections));
        }, this);
        return transCoord;
    },

    transformPoint: function (point, projections) {
        point.pop();
        return proj4(projections.sourceProj, projections.destProj, point);
    },

    // Features in die Karte laden
    featuresToMap: function () {
        var features = this.get("features"),
            source = this.get("source");

        source.addFeatures(features);
    },

    setText: function (value) {
        this.set("text", value);
    },

    setFeatures: function (value) {
        this.set("features", value);
    },

    setSource: function (value) {
        this.set("source", value);
    },

    setLayer: function (value) {
        this.set("layer", value);
    },

    setFormat: function (value) {
        this.set("format", value);
    }
});

export default ImportTool;
