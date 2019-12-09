import proj4 from "proj4";
// import {get as getProjection, getTransform} from 'ol/proj';
import {KML, GeoJSON, GPX} from "ol/format.js";
import Tool from "../../core/modelList/tool/model";
import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";

const DownloadModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        id: "download",
        name: "Download",
        glyphicon: "glyphicon-plus",
        renderToWindow: true,
        channel: Radio.channel("Download"),
        formats: ["KML"],
        selectedFormat: "",
        features: [],
        dataString: "",
        fileName: ""
    }),
    initialize: function () {
        this.superInitialize();
        this.listenTo(this.get("channel"), {
            "start": this.start
        });
    },
    start: function (obj) {
        if (obj.features.length === 0) {
            Radio.trigger("Alert", "alert", "Bitte erstellen Sie zuerst eine Zeichnung oder einen Text!");
            return;
        }
        _.each(obj.features, function (feature) {
            if (feature.getGeometry() instanceof Circle) {
            // creates a regular polygon from a circle with 32(default) sides
                feature.setGeometry(fromCircle(feature.getGeometry()));
            }
        });

        this.setFormats(obj.formats);
        this.setFeatures(obj.features);
        Radio.request("ModelList", "getModelByAttributes", {id: "draw"}).set("isActive", false);
        this.set("isActive", true);
    },

    prepareData: function () {
        let features = this.get("features");
        const selectedFormat = this.get("selectedFormat"),
            formatKml = new KML({extractStyles: true}),
            formatGeoJson = new GeoJSON(),
            formatGpx = new GPX();

        switch (selectedFormat) {
            case "KML":
                features = this.convertFeaturesToKML(features, formatKml);
                break;
            case "GeoJSON":
                features = this.convertFeatures(features, formatGeoJson);
                break;
            case "GPX":
                features = this.convertFeatures(features, formatGpx);
                break;
            default:
                Radio.trigger("Alert", "alert", "Das Format " + selectedFormat + " wird noch nicht unterstützt.");
        }
        this.setDataString(features);
    },
    convertFeatures: function (features, format) {
        let convertedFeatures = [];

        features.forEach(feature => {
            const featureClone = feature.clone(),
                transCoord = this.transformCoords(featureClone.getGeometry(), this.getProjections("EPSG:25832", "EPSG:4326", "32"));

            // für den Download nach einem Import! Z-Koordinate absägen
            if (transCoord.length === 3) {
                transCoord.pop();
            }

            featureClone.getGeometry().setCoordinates(transCoord, "XY");
            convertedFeatures.push(featureClone);
        }, this);
        convertedFeatures = format.writeFeatures(convertedFeatures);
        return convertedFeatures;
    },
    convertFeaturesToKML: function (features, format) {
        var pointOpacities = [],
            pointColors = [],
            convertedFeatures = [],
            pointRadiuses = [],
            textFonts = [];

        features.forEach(feature => {
            var type,
                styles,
                color,
                style;

            type = feature.getGeometry().getType();
            styles = feature.getStyleFunction().call(feature);
            style = styles[0];

            // wenn Punkt-Geometrie
            if (type === "Point") {

                if (feature.getStyle().getText()) {
                    textFonts.push(feature.getStyle().getText().getFont());
                    pointOpacities.push(undefined);
                    pointColors.push(undefined);
                    pointRadiuses.push(undefined);
                }
                // wenn es kein Text ist(also Punkt), werden Farbe, Transparenz und Radius in arrays gespeichert um dann das KML zu erweitern.
                else {
                    color = style.getImage().getFill().getColor();
                    pointOpacities.push(style.getImage().getFill().getColor()[3]);
                    pointColors.push(color[0] + "," + color[1] + "," + color[2]);
                    pointRadiuses.push(style.getImage().getRadius());
                    textFonts.push(undefined);
                }

            }
        }, this);

        // KML zerlegen und die Punktstyles einfügen
        convertedFeatures = $.parseXML(this.convertFeatures(features, format));

        $(convertedFeatures).find("Point").each(function (i, point) {
            var placemark = point.parentNode,
                style,
                pointStyle,
                fontStyle;

            if ($(placemark).find("name")[0]) {
                style = $(placemark).find("LabelStyle")[0];
                fontStyle = "<font>" + textFonts[i] + "</font>";
                $(style).append($(fontStyle));
            }
            // kein Text, muss also Punkt sein
            else {
                style = $(placemark).find("Style")[0];
                pointStyle = "<pointstyle>";

                pointStyle += "<color>" + pointColors[i] + "</color>";
                pointStyle += "<transparency>" + pointOpacities[i] + "</transparency>";
                pointStyle += "<radius>" + pointRadiuses[i] + "</radius>";
                pointStyle += "</pointstyle>";

                $(style).append($(pointStyle));
            }

        });
        return new XMLSerializer().serializeToString(convertedFeatures);
    },

    getProjections: function (sourceProj, destProj, zone) {
        proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");

        return {
            sourceProj: proj4(sourceProj),
            destProj: proj4(destProj)
        };
    },

    transformCoords: function (geometry, projections) {

        var transCoord = [];

        switch (geometry.getType()) {
            case "Polygon": {
                transCoord = this.transformPolygon(geometry.getCoordinates(), projections);
                break;
            }
            case "Point": {
                transCoord = this.transformPoint(geometry.getCoordinates(), projections);
                break;
            }
            case "LineString": {
                transCoord = this.transformLine(geometry.getCoordinates(), projections);
                break;
            }
            default: {
                Radio.trigger("Alert", "alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
            }
        }
        return transCoord;
    },

    transformPolygon: function (coords, projections) {

        var transCoord = [];

        // multiple Points
        _.each(coords, function (points) {
            _.each(points, function (point) {
                transCoord.push(this.transformPoint(point, projections));
            });
        }, this);
        return [transCoord];
    },

    transformLine: function (coords, projections) {

        var transCoord = [];

        // multiple Points
        _.each(coords, function (point) {
            transCoord.push(this.transformPoint(point, projections));
        }, this);
        return transCoord;
    },

    transformPoint: function (point, projections) {
        return proj4(projections.sourceProj, projections.destProj, point);
    },

    isInternetExplorer: function () {
        return window.navigator.msSaveOrOpenBlob;
    },
    validateFileName: function () {
        const fileName = this.get("fileName"),
            selectedFormat = this.get("selectedFormat"),
            suffix = "." + selectedFormat;
        let validatedFileName,
            result;

        if (fileName.length > 0 && selectedFormat.length > 0) {
            fileName.trim();
            result = fileName.match(/^[0-9a-zA-Z]+(\.[0-9a-zA-Z]+)?$/);
            if (_.isUndefined(result) || _.isNull(result)) {
                Radio.trigger("Alert", "alert", "Bitte geben Sie einen gültigen Dateinamen ein! (Erlaubt sind Klein-,Großbuchstaben und Zahlen.)");
            }
            else if (fileName.indexOf(suffix, fileName.length - suffix.length) === -1) {
                validatedFileName = fileName + "." + selectedFormat;
            }
            else {
                validatedFileName = fileName;
            }
        }

        return validatedFileName;
    },
    setFormats: function (value) {
        this.set("formats", value);
    },

    setFeatures: function (value) {
        this.set("features", value);
    },
    setDataString: function (value) {
        this.set("dataString", value);
    },
    setSelectedFormat: function (value) {
        this.set("selectedFormat", value);
    },
    setFileName: function (value) {
        this.set("fileName", value);
    }
});

export default DownloadModel;
