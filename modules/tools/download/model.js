import proj4 from "proj4";
import {KML, GeoJSON, GPX} from "ol/format.js";
import Tool from "../../core/modelList/tool/model";
import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import * as constants from "../../../src/modules/tools/draw/store/constantsDraw";

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
        colorConstants: [],
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
        this.setColorConstants(constants.pointColorOptions);
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

        Radio.trigger("ModelList", "setActiveToolsToFalse", Radio.request("ModelList", "getModelByAttributes", {id: "download"}));
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

            if (transCoord.length === 3 && transCoord[2] === 0) {
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
        const featureCount = features.length,
            pointOpacities = new Array(featureCount),
            pointColors = new Array(featureCount),
            hasIconUrl = new Array(featureCount),
            anchors = new Array(featureCount),
            textFonts = new Array(featureCount),
            skip = new Array(featureCount);
        let convertedFeatures = [];

        pointOpacities.fill(undefined, 0, featureCount);
        pointColors.fill(undefined, 0, featureCount);
        hasIconUrl.fill(false, 0, featureCount);
        anchors.fill(undefined, 0, featureCount);
        textFonts.fill(undefined, 0, featureCount);
        skip.fill(false, 0, featureCount);

        features.forEach((feature, i) => {
            const type = feature.getGeometry().getType();
            let styles,
                style,
                color;

            if (feature.getGeometry().getType() === "Point" && feature.values_.name !== undefined) {
                // imported kml with text, can be used as it is
                skip[i] = true;
            }
            else {
                try {
                    styles = feature.getStyleFunction().call(feature);
                    style = styles[0];
                }
                catch (ex) {
                    // only happens if an imported kml is exported, can be skipped
                    skip[i] = true;
                }

                if (type === "Point") {
                    if (style.getImage() !== null && style.getImage().iconImage_ !== undefined) {
                        // imported kml with link to svg icon, has iconUrl from previous import
                        hasIconUrl[i] = true;
                        const anchorXUnits = style.getImage().anchorXUnits_,
                            anchorYUnits = style.getImage().anchorYUnits_,
                            anchor = style.getImage().anchor_;

                        anchors[i] = {xUnit: anchorXUnits, yunit: anchorYUnits, anchor: anchor};

                    }
                    else if (feature.getStyle().getText()) {
                        textFonts[i] = feature.getStyle().getText().getFont();
                    }
                    else {
                        color = style.getImage().getFill().getColor();
                        pointOpacities[i] = style.getImage().getFill().getColor()[3];
                        pointColors[i] = [color[0], color[1], color[2]];
                    }

                }
            }
        }, this);

        convertedFeatures = new DOMParser().parseFromString(this.convertFeatures(features, format), "text/xml");
        this.addUniqueStyleId(convertedFeatures);

        convertedFeatures.getElementsByTagName("Placemark").forEach((placemark, i) => {
            const style = placemark.getElementsByTagName("Style")[0];

            if (placemark.getElementsByTagName("Point").length > 0 && skip[i] === false) {
                if (placemark.getElementsByTagName("name")[0]) {
                    const labelStyle = placemark.getElementsByTagName("LabelStyle")[0],
                        // please be aware of devtools/tasks/replace.js and devtools/tasks/customBuildPortalconfigsReplace.js if you change the path of the svg
                        iconUrl = window.location.origin + "/img/tools/draw/circle_blue.svg";

                    if (textFonts[i]) {
                        labelStyle.innerHTML += this.getKmlScaleOfLableStyle(this.getScaleFromFontSize(textFonts[i]));
                    }
                    style.innerHTML += this.createKmlIconStyle(iconUrl, 0);
                }
                else if (hasIconUrl[i] === false && pointColors[i]) {
                    // please be aware of devtools/tasks/replace.js and devtools/tasks/customBuildPortalconfigsReplace.js if you change the path of the svg
                    const iconUrl = window.location.origin + "/img/tools/draw/circle_" + this.getIconColor(pointColors[i]) + ".svg",
                        iconStyle = this.createKmlIconStyle(iconUrl, 1);

                    style.innerHTML += iconStyle;
                }
                else if (hasIconUrl[i] === true && anchors[i] !== undefined) {
                    const iconStyle = placemark.getElementsByTagName("IconStyle")[0];

                    iconStyle.innerHTML += this.getKmlHotSpotOfIconStyle(anchors[i]);
                }
            }

        });
        return new XMLSerializer().serializeToString(convertedFeatures);
    },

    /**
     * Each extendedData in converted features contains a styleId, this must be unique, else printing does not work.
     * @param {Document} convertedFeatures converted features
     * @returns {void}
     */
    addUniqueStyleId: function (convertedFeatures) {
        convertedFeatures.getElementsByTagName("ExtendedData").forEach((extendedData) => {
            extendedData.getElementsByTagName("value")[0].textContent = Radio.request("Util", "uniqueId", "");
        });
    },

    /**
     * Returns an scale-value for kml name tag, depending on the font size
     * @param {string} fontSize size as string got from feature style text
     * @returns {number} the scale
     */
    getScaleFromFontSize: function (fontSize) {
        const size = parseInt(fontSize.substr(0, 2), 10);

        if (size <= 12) {
            return 0;
        }
        else if (size <= 20) {
            return 1;
        }
        else if (size <= 32) {
            return 2;
        }
        return 1;
    },

    /**
     * Constructs the hotspot-tag (anchoring of the icon) of an IconStyle-Part of a Point-KML.
     * @see https://developers.google.com/kml/documentation/kmlreference#hotspot
     * @param {object} anchor to get the values from
     * @returns {string} hotspot-tag for a kml IconStyle
     */
    getKmlHotSpotOfIconStyle: function (anchor) {
        let style = "<hotSpot ";

        style += "x=\"" + anchor.anchor[0] + "\" ";
        style += "y=\"" + anchor.anchor[1] + "\" ";
        style += "xunits=\"" + anchor.xUnit + "\" ";
        style += "yunits=\"" + anchor.yunit + "\" ";
        style += " />";
        return style;
    },

    /**
     * Adds the scale to the LabelStyle-Part of a Point-KML.
     * @see https://developers.google.com/kml/documentation/kmlreference#iconstyle
     * @param {number} scale to add
     * @returns {string} the LabelStyle part of a kml-file.
     */
    getKmlScaleOfLableStyle: function (scale) {
        let style = "<colorMode>normal</colorMode>";

        style += "<scale>" + scale + "</scale>";
        return style;
    },

    /**
     * Returns the IconStyle-Part of the Point-KML containing a link to a svg.
     * @see https://developers.google.com/kml/documentation/kmlreference#iconstyle
     * @param {string} url to the icon
     * @param {number} scale of the icon, 0 means icon is not displayed
     * @returns {string} the IconStyle part of a kml-file.
     */
    createKmlIconStyle: function (url, scale) {
        let style = "<IconStyle>";

        style += "<scale>" + scale + "</scale>";
        style += "<Icon>";
        style += "<href>" + url + "</href>";
        style += "</Icon>";
        style += "</IconStyle>";

        return style;
    },


    /**
     * Compares the 3 first values in the color-array with constant values for colors.
     * @param {array} color containing the rgb-Values of a color
     * @returns {string} a textual value for each color, e.g. "blue"
     */
    getIconColor: function (color) {
        const colorConstants = this.get("colorConstants"),
            colOption = colorConstants.filter(option => this.allCompareEqual(color, option.value));

        if (colOption && colOption[0]) {
            return colOption[0].color;
        }
        return "";
    },

    /**
     * Compares the first, second and third entry in the given arrays for equality.
     * @param {array} array1 to compare
     * @param {array} array2 to compare
     * @returns {boolean} true, if entry 1-3 are equals
     */
    allCompareEqual: function (array1, array2) {
        if (!Array.isArray(array1) || Array.isArray(array1) && array1.length < 3 || !Array.isArray(array2) || Array.isArray(array2) && array2.length < 3) {
            return false;
        }
        return array1[0] === array2[0] && array1[1] === array2[1] && array1[2] === array2[2];
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
        const btn = document.getElementsByClassName("downloadBtn")[0];

        if (isDisabled) {
            btn.setAttribute("disabled", isDisabled);
        }
        else {
            btn.removeAttribute("disabled");
        }
    },

    /**
     * Prepares the download button for nonIE browsers.
     * @returns {void}
     */
    prepareDownloadButtonNonIE: function () {
        const url = "data:text/plain;charset=utf-8,%EF%BB%BF" + encodeURIComponent(this.get("dataString"));

        document.getElementsByClassName("downloadFile")[0].setAttribute("href", url);
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
            document.getElementsByClassName("downloadFile")[0].setAttribute("download", this.validateFileNameAndExtension());
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
     * Setter for attribute "blob".
     * @param {Blob} value Blob.
     * @returns {void}
     */
    setColorConstants: function (value) {
        this.set("colorConstants", value);
    },

    /**
     * Setter for attribute "isInternetExplorer".
     * @param {Boolean} value Flag if browser is ie.
     * @returns {void}
     */
    setIsInternetExplorer: function (value) {
        this.set("isInternetExplorer", value);
    },

    /**
     * Setter for attribute "store".
     * @param {Boolean} value The Vuex store.
     * @returns {void}
     */
    setStore: function (value) {
        this.set("store", value);
    }
});

export default DownloadModel;
