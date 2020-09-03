import proj4 from "proj4";
import {KML, GeoJSON, GPX} from "ol/format.js";
import Tool from "../../core/modelList/tool/model";
import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import store from "../../../src/app-store/index";

const DownloadModel = Tool.extend(/** @lends DownloadModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        id: "download",
        name: "Download",
        glyphicon: "glyphicon-plus",
        renderToWindow: true,
        channel: Radio.channel("Download"),
        formats: ["KML", "GEOJSON", "GPX"],
        selectedFormat: "",
        features: [],
        dataString: "",
        fileName: "",
        isInternetExplorer: undefined,
        blob: undefined,
        // translations:
        createFirstText: "",
        unknownGeometry: "",
        formatText: "",
        pleaseChooseText: "",
        filenameText: "",
        enterFilenameText: "",
        loadDownText: "",
        backText: ""
    }),

    /**
     * @class DownloadModel
     * @extends Tool
     * @memberof Tools.Download
     * @property {String} id="download" Id.
     * @property {String} name="Download" Name.
     * @property {String} glyphicon="glyphicon-plus" Glyphicon class.
     * @property {Boolean} renderToWindow=true Flag if tool should render to tool window.
     * @property {Radio.channel} channel Channel of tool.
     * @property {String[]} formats=["KML", "GEOJSON", "GPX"] Default formats that are supported.
     * @property {String} selectedFormat="" The selected format.
     * @property {ol/Feature[]} features=[] The features to be donloaded.
     * @property {String} dataString="" The features converted as dataString.
     * @property {String} fileName="" The filename.
     * @property {String} createFirstText="", filled with "Bitte erstellen Sie zuerst eine Zeichnung oder einen Text!"- translated
     * @property {String} unknownGeometry="", filled with "Unbekannte Geometry:"- translated
     * @property {String} formatText="", filled with "Format"- translated
     * @property {String} pleaseChooseText="", filled with "Bitte Auswählen"- translated
     * @property {String} filenameText="", filled with "Dateiname"- translated
     * @property {String} enterFilenameText="", filled with "Bitte Dateiname angeben"- translated
     * @property {String} loadDownText="", filled with "Herunterladen"- translated
     * @property {String} backText="", filled with "Zurück"- translated
     * @listens Tools.Download#RadioTriggerDownloadStart
     * @listens i18next#RadioTriggerLanguageChanged
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core#RadioRequestUtilIsInternetExplorer
     * @fires Tools.Download#changeIsActive
     * @constructs
     */
    initialize: function () {
        this.superInitialize();
        this.changeLang(i18next.language);
        this.listenTo(this.get("channel"), {
            "start": this.start
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function () {
        this.set({
            createFirstText: i18next.t("common:modules.tools.download.createFirst"),
            unknownGeometry: i18next.t("common:modules.tools.download.unknownGeometry"),
            formatText: i18next.t("common:modules.tools.download.format"),
            pleaseChooseText: i18next.t("common:modules.tools.download.pleaseChoose"),
            filenameText: i18next.t("common:modules.tools.download.filename"),
            enterFilenameText: i18next.t("common:modules.tools.download.enterFilename"),
            loadDownText: i18next.t("common:button.download"),
            backText: i18next.t("common:button.back")
        });
    },

    /**
     * @param {Object} obj Configuration to start the download module.
     * @param {String[]} obj.formats Formats to be supported.
     * @param {ol/Feature[]} obj.features Features to be downloaded.
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    start: function (obj) {
        if (obj.features.length === 0) {
            Radio.trigger("Alert", "alert", this.get("createFirstText"));
            return;
        }
        obj.features.forEach(feature => {
            if (feature.getGeometry() instanceof Circle) {
                feature.setGeometry(fromCircle(feature.getGeometry()));
            }
        });

        this.setFormats(obj.formats);
        this.setFeatures(obj.features);

        Radio.request("ModelList", "getModelByAttributes", {id: "draw"}).set("isActive", false);
        store.dispatch("Tools/setToolActive", {id: "draw", active: false});
        this.set("isActive", true);
    },

    /**
     * Converts the data and saves it to the param "dataString"
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
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
            case "GEOJSON":
                features = this.convertFeatures(features, formatGeoJson);
                break;
            case "GPX":
                features = this.convertFeatures(features, formatGpx);
                break;
            case "none":
                features = "";
                this.setSelectedFormat("");
                break;
            default:
                Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.download.formatNotSupported"), {selectedFormat: selectedFormat});
        }
        this.setDataString(features);
    },

    /**
     * Converts the given features into the given format.
     * @param {ol/Feature[]} features The features to be downloaded.
     * @param {ol/Format} format The format for the features to be downloaded.
     * @return {String} - The converted features as string.
     */
    convertFeatures: function (features, format) {
        let convertedFeatures = [];

        features.forEach(feature => {
            const featureClone = feature.clone(),
                transCoord = this.transformCoords(featureClone.getGeometry(), this.getProjections("EPSG:25832", "EPSG:4326", "32"));

            if (transCoord.length === 3) {
                transCoord.pop();
            }

            featureClone.getGeometry().setCoordinates(transCoord, "XY");
            convertedFeatures.push(featureClone);
        }, this);
        convertedFeatures = format.writeFeatures(convertedFeatures);
        return convertedFeatures;
    },

    /**
     * Converts features to KML and also storing the style information.
     * @param {ol/Feature[]} features The features to be downloaded.
     * @param {ol/Format} format The format for the features to be downloaded.
     * @return {String} - The converted features as string.
     */
    convertFeaturesToKML: function (features, format) {
        const pointOpacities = [],
            pointColors = [],
            pointRadiuses = [],
            textFonts = [];
        let convertedFeatures = [];

        features.forEach(feature => {
            const type = feature.getGeometry().getType(),
                styles = feature.getStyleFunction().call(feature),
                style = styles[0];
            let color;

            if (type === "Point") {
                if (feature.getStyle().getText()) {
                    textFonts.push(feature.getStyle().getText().getFont());
                    pointOpacities.push(undefined);
                    pointColors.push(undefined);
                    pointRadiuses.push(undefined);
                }
                else {
                    color = style.getImage().getFill().getColor();
                    pointOpacities.push(style.getImage().getFill().getColor()[3]);
                    pointColors.push(color[0] + "," + color[1] + "," + color[2]);
                    pointRadiuses.push(style.getImage().getRadius());
                    textFonts.push(undefined);
                }

            }
        }, this);

        convertedFeatures = $.parseXML(this.convertFeatures(features, format));

        $(convertedFeatures).find("Point").each(function (i, point) {
            const placemark = point.parentNode;
            let style,
                pointStyle,
                fontStyle;

            if ($(placemark).find("name")[0]) {
                style = $(placemark).find("LabelStyle")[0];
                fontStyle = "<font>" + textFonts[i] + "</font>";
                $(style).append($(fontStyle));
            }
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

    /**
     * Gets the projection in proj4 format.
     * @param {String} sourceProj Source projection name.
     * @param {String} destProj Destination projection name.
     * @param {String} zone Zone of source projection.
     * @returns {Object} - an object with the definitions of the goven projection names.
     */
    getProjections: function (sourceProj, destProj, zone) {
        proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");

        return {
            sourceProj: proj4(sourceProj),
            destProj: proj4(destProj)
        };
    },

    /**
     * Transform the given Geometry into the given projections.
     * @param {ol/Geom} geometry Geometry.
     * @param {Object} projections Object containing the projections.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {ol/Coordinate} - The projected coordinates.
     */
    transformCoords: function (geometry, projections) {
        let transCoord = [];

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
                Radio.trigger("Alert", "alert", this.get("unknownGeometry") + " <br><strong>" + geometry.getType());
            }
        }
        return transCoord;
    },

    /**
     * Transform the given polygon coords into the given projections.
     * @param {ol/Coordinate} coords Coordinates.
     * @param {Object} projections Object containing the projections.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {ol/Coordinate} - The projected coordinates.
     */
    transformPolygon: function (coords, projections) {
        const transCoord = [];

        coords.forEach(points => {
            points.forEach(point => {
                transCoord.push(this.transformPoint(point, projections));
            }, this);
        }, this);
        return [transCoord];
    },

    /**
     * Transform the given line coords into the given projections.
     * @param {ol/Coordinate} coords Coordinates.
     * @param {Object} projections Object containing the projections.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {ol/Coordinate} - The projected coordinates.
     */
    transformLine: function (coords, projections) {
        const transCoord = [];

        coords.forEach(point => {
            transCoord.push(this.transformPoint(point, projections));
        }, this);
        return transCoord;
    },

    /**
     * Transform the given point coords into the given projections.
     * @param {ol/Coordinate} point Coordinates.
     * @param {Object} projections Object containing the projections.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {ol/Coordinate} - The projected coordinates.
     */
    transformPoint: function (point, projections) {
        return proj4(projections.sourceProj, projections.destProj, point);
    },

    /**
     * Validates the Filename and appends the extension if the user didnt add it.
     * @returns {String} - the generated fileName.
     */
    validateFileNameAndExtension: function () {
        const fileName = this.get("fileName"),
            selectedFormat = this.get("selectedFormat"),
            suffix = "." + selectedFormat.toLowerCase();
        let validatedFileName;

        if (fileName.length > 0 && selectedFormat.length > 0) {
            if (!fileName.toLowerCase().endsWith(suffix)) {
                validatedFileName = fileName + suffix;
            }
            else {
                validatedFileName = fileName;
            }
        }
        return validatedFileName;
    },

    /**
     * Prepares the download button. Distinguishes between IE and nonIE.
     * @fires Core#RadioRequestUtilIsInternetExplorer
     * @returns {void}
     */
    prepareDownloadButton: function () {
        const fileName = this.validateFileNameAndExtension(),
            isInternetExplorer = Radio.request("Util", "isInternetExplorer");

        this.setIsInternetExplorer(isInternetExplorer);
        if (fileName) {
            if (isInternetExplorer) {
                this.prepareDownloadButtonIE();
            }
            else {
                this.prepareDownloadButtonNonIE();
            }
            this.setDisabledOnDownloadButton(false);
        }
        else {
            this.setDisabledOnDownloadButton(true);
        }
    },

    /**
     * Enables or disables the download button.
     * @param {Boolean} isDisabled Flag if download button is disabled or not.
     * @returns {void}
     */
    setDisabledOnDownloadButton: function (isDisabled) {
        $(".downloadBtn").prop("disabled", isDisabled);
    },

    /**
     * Prepares the download button for nonIE browsers.
     * @returns {void}
     */
    prepareDownloadButtonNonIE: function () {
        const url = "data:text/plain;charset=utf-8,%EF%BB%BF" + encodeURIComponent(this.get("dataString"));

        $(".downloadFile").attr("href", url);
    },

    /**
     * Prepares the download button for IE browsers.
     * @returns {void}
     */
    prepareDownloadButtonIE: function () {
        const fileData = [this.get("dataString")],
            blobObject = new Blob(fileData);

        this.setBlob(blobObject);
    },

    /**
     * Triggers the download
     * @returns {void}
     */
    download: function () {
        if (this.get("isInternetExplorer")) {
            window.navigator.msSaveOrOpenBlob(this.get("blob"), this.validateFileNameAndExtension());
        }
        else {
            $(".downloadFile").attr("download", this.validateFileNameAndExtension());
        }
    },
    /**
     * Resets the model.
     * @returns {void}
     */
    reset: function () {
        this.setFormats([]);
        this.setFeatures([]);
        this.setDataString("");
        this.setSelectedFormat("");
        this.setFileName("");
    },

    /**
     * Setter for attribute "formats".
     * @param {String[]} value Formats.
     * @returns {void}
     */
    setFormats: function (value) {
        this.set("formats", value);
    },

    /**
     * Setter for attribute "features".
     * @param {ol/Feature[]} value Features.
     * @returns {void}
     */
    setFeatures: function (value) {
        this.set("features", value);
    },

    /**
     * Setter for attribute "dataString".
     * @param {String} value The features saved as string.
     * @returns {void}
     */
    setDataString: function (value) {
        this.set("dataString", value);
    },

    /**
     * Setter for attribute "selectedFormat".
     * @param {String} value The selected Format.
     * @returns {void}
     */
    setSelectedFormat: function (value) {
        this.set("selectedFormat", value);
    },

    /**
     * Setter for attribute "fileName".
     * @param {String} value Filename without extension.
     * @returns {void}
     */
    setFileName: function (value) {
        this.set("fileName", value);
    },

    /**
     * Setter for attribute "blob".
     * @param {Blob} value Blob.
     * @returns {void}
     */
    setBlob: function (value) {
        this.set("blob", value);
    },

    /**
     * Setter for attribute "isInternetExplorer".
     * @param {Boolean} value Flag if browser is ie.
     * @returns {void}
     */
    setIsInternetExplorer: function (value) {
        this.set("isInternetExplorer", value);
    }
});

export default DownloadModel;
