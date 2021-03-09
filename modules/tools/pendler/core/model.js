import Tool from "../../../core/modelList/tool/model";
import {Stroke, Style, Text} from "ol/style.js";
import {extend as olExpandExtent} from "ol/extent.js";
import {Point} from "ol/geom.js";
import Feature from "ol/Feature.js";
import {WFS} from "ol/format.js";
import store from "../../../../src/app-store";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

const PendlerCoreModel = Tool.extend(/** @lends PendlerCoreModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        kreis: "",
        kreise: [],
        pendlerLegend: [],
        renderToWindow: true,
        zoomLevel: 1,
        url: "https://geodienste.hamburg.de/MRH_WFS_Pendlerstroeme_im_Tool",
        params: {
            REQUEST: "GetFeature",
            SERVICE: "WFS",
            TYPENAME: "app:mrh_kreise",
            VERSION: "1.1.0",
            maxFeatures: "10000"
        },
        wfsappGemeinde: "mrh_einpendler_gemeinde",
        wfsappKreise: "mrh_pendler_kreise",
        featureType: "mrh_pendler_kreise",
        trefferAnzahl: "top5",
        attrAnzahl: "anzahl_einpendler",
        attrGemeinde: "wohnort",
        attrGemeindeContrary: "arbeitsort",
        useProxy: false
    }),
    /**
     * @class PendlerCoreModel
     * @extends Tool
     * @memberof pendler
     * @constructs
     * @property {String} kreis="" name of the landkreis
     * @property {Array} kreise=[] names of landkreise
     * @property {Array} pendlerLegend=[] the legend
     * @property {Boolean} renderToWindow=true Flag if tool should be rendered in window
     * @property {Number} zoomLevel=1 level map is zoomed
     * @property {String} url= "https://geodienste.hamburg.de/MRH_WFS_Pendlerstroeme_im_Tool" url to get the 'Pendlerstroeme'
     * @property {Object} params= {
            REQUEST: "GetFeature",
            SERVICE: "WFS",
            TYPENAME: "app:mrh_kreise",
            VERSION: "1.1.0",
            maxFeatures: "10000"
        } Request params to get the features.
     * @property {String} featureType= "mrh_einpendler_gemeinde" name of a feature type
     * @property {String} attrAnzahl="anzahl_einpendler" name of the attribute for count of commuter
     * @property {String} attrGemeinde="wohnort" name of the attribute called 'gemeinde'
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @fires //todo
     * @listens Alerting#RadioTriggerAlertConfirmed
     */
    initialize: function () {
        const channel = Radio.channel("Animation");

        this.superInitialize();
        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            }
        }, this);

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.resetWindow();
                    Radio.trigger("Attributions", "createAttribution", model.get("name"), i18next.t("common:modules.tools.pendler.general.attributionText"), "Pendler");
                }
                else {
                    Radio.trigger("Attributions", "removeAttribution", model.get("name"), i18next.t("common:modules.tools.pendler.general.attributionText"), "Pendler");
                }
            }
        });

        this.listenTo(this, {
            "change:kreis": function (model, value) {
                this.unset("direction", {silent: true});
                this.unset("gemeinde");
                this.clear();
                this.setParams({
                    REQUEST: "GetFeature",
                    SERVICE: "WFS",
                    VERSION: "2.0.0",
                    StoredQuery_ID: "SamtgemeindeZuKreis",
                    kreis: value
                });
                this.sendRequest("GET", this.get("params"), this.parseGemeinden);
            },
            "change:featureType": function () {
                this.unset("gemeinde", {silent: true});
                this.unset("direction");
                this.clear();
            },
            "change:gemeinde": function () {
                this.unset("direction", {silent: true});
                this.clear();
            },
            "change:trefferAnzahl": function () {
                this.unset("direction", {silent: true});
                this.clear();
            },
            "change:direction": function (model, value) {
                this.set("pendlerLegend", [], {silent: true});
                this.set("emptyResult", false, {silent: true});
                this.clear();
                if (value === "arbeitsort") {
                    this.setAttrGemeinde("wohnort");
                    this.setAttrGemeindeContrary("arbeitsort");
                }
                else {
                    this.setAttrGemeinde("arbeitsort");
                    this.setAttrGemeindeContrary("wohnort");
                }

                const literal = this.get("featureType") === this.get("wfsappGemeinde") ? this.get("gemeinde") : this.get("kreis");

                this.createPostBody(this.get("featureType"), value, literal);
            },
            "change:postBody": function (model, value) {
                this.sendRequest("POST", value, data => {
                    this.parseFeatures(data, this.get("featureType"));
                });
            }
        });
        this.sendRequest("GET", this.get("params"), this.parseKreise);
    },

    /**
     * Führt einen HTTP-Request aus
     * @param {String} type - GET oder POST
     * @param {String} data - data to send
     * @param {function} successFunction - Wird aufgerufen wenn der Request erfolgreich war
     * @returns {void}
     */
    sendRequest: function (type, data, successFunction) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url");

        $.ajax({
            url: url,
            data: data,
            contentType: "text/xml",
            type: type,
            context: this,
            success: successFunction,
            error: function (jqXHR, errorText, error) {
                console.error("Loading of " + url + " failed:", error);
            }
        });
    },

    /**
     * Übergibt die Zentrumskoordinate der Gemeinde an die MapView, abhängig der Richtung.
     * @param {bool} setMarker Wenn "true" wir ein Marker gesetzt.
     * @returns {void}
     */
    centerGemeinde: function (setMarker) {
        let coords = [];

        if (this.get("direction") === "wohnort") {
            coords = this.get("lineFeatures")[0].getGeometry().getFirstCoordinate();
        }
        else {
            coords = this.get("lineFeatures")[0].getGeometry().getLastCoordinate();
        }

        Radio.trigger("MapView", "setCenter", coords, this.get("zoomLevel"));

        if (setMarker) {
            store.dispatch("MapMarker/placingPointMarker", coords);
        }
    },


    /**
     * Success Funktion für die Landkreise
     * @param  {object} data - Response
     * @returns {void}
     */
    parseKreise: function (data) {
        const kreise = [],
            hits = $("gml\\:featureMember,featureMember", data);
        let kreis;

        hits.toArray().forEach(hit => {
            kreis = $(hit).find("app\\:kreisname,kreisname")[0].textContent;
            kreise.push(kreis);
        });

        this.setKreise(kreise.sort().filter(feature => !["Bremen", "Berlin", "Kiel", "Hannover"].includes(feature)));
        if (this.get("isActive")) {
            this.trigger("render", this, true);
        }
    },

    /**
     * Success Funktion für die Gemeinden
     * @param  {ojbect} data - Response
     * @returns {void}
     */
    parseGemeinden: function (data) {
        const gemeinden = [],
            hits = $("wfs\\:member,member", data);
        let gemeinde;

        hits.toArray().forEach(hit => {
            gemeinde = $(hit).find("app\\:gemeinde,gemeinde")[0].textContent;
            gemeinden.push(gemeinde);
        });
        this.setGemeinden(gemeinden.sort());
    },

    /**
     * Success Funktion für die Features
     * @param  {Object} data - Response
     * @param {String} featureType the featureType to use as Query typeName, without app-prefix
     * @returns {void}
     */
    parseFeatures: function (data, featureType) {
        const wfsReader = new WFS({
            featureNS: "http://www.deegree.org/app",
            featureType
        });

        this.setLineFeatures(wfsReader.readFeatures(data));
        this.handleData();
    },

    /**
     * Übernehme nur die vorgegebene Anzahl an Features aus der Liste und verwerfe
     * den Rest. Gezählt wird von vorne.
     * @param {Object[]} features Zu kürzende Feature-Liste
     * @param {String} limitText Anzahl der zu übernehmenden Features in Textform (TopX, Alle)
     * @returns {Object[]} Gekürzte Feature-Liste
     */
    truncateFeatureList: function (features, limitText) {
        let limit;

        switch (limitText) {
            case "top5":
                limit = 5;
                break;
            case "top10":
                limit = 10;
                break;
            case "top15":
                limit = 15;
                break;
            // case "alle": // Deaktiviert, da das Fenster zur Darstellung keine ausreichende Größe besitzt.
            default:
                // Nichts zu tun, gebe die ungeänderte Liste zurück
                return features;
        }

        // Gebe eine nach <limit> Einträgen abgeschnittene Liste zurück
        return features.slice(0, limit);
    },

    /**
     * Sortieren der Features nach Pendler-Anzahl sowie Abschneiden der Liste gemäß der Top-Angabe.
     * @param {Object[]} rawFeatures Feature-Liste
     * @returns {Object[]} Stortierte und Abgeschnittene Feature-Liste
     */
    selectFeatures: function (rawFeatures) {
        // Sortiere nach Anzahl der Pendler
        rawFeatures.sort((featureA, featureB) => (featureA.get(this.get("attrAnzahl")) * -1) - (featureB.get(this.get("attrAnzahl")) * -1));

        // Schneide Liste gemäß gewähltem Top ab
        return this.truncateFeatureList(rawFeatures, this.get("trefferAnzahl"));
    },

    /**
     * Bereite den Inhalt der Abfrage an den WFS vor.
     * @param {String} featureType the featureType to use as Query typeName, without app-prefix
     * @param {String} value Abzufragender Schlüssel (im Falle des Pendler-Tools: "Wohnort" oder "Arbeitsplatz")
     * @param {String} literal the location to lookup
     * @returns {void} Kein Rückgabewert
     */
    createPostBody: function (featureType, value, literal) {
        const postBody = "<?xml version='1.0' encoding='UTF-8' ?>" +
            "<wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc'>" +
            "<wfs:Query typeName='app:" + featureType + "'>" +
            "<ogc:Filter>" +
            "<ogc:PropertyIsEqualTo>" +
            "<ogc:PropertyName>app:" + value + "</ogc:PropertyName>" +
            "<ogc:Literal>" + literal + "</ogc:Literal>" +
            "</ogc:PropertyIsEqualTo>" +
            "</ogc:Filter>" +
            "</wfs:Query>" +
            "</wfs:GetFeature>";

        // Wenn sich die zu betrachtende Gemeinde nicht geändert hat bleibt der Request gleich
        // und muss nicht erneut gestellt werden. Löse stattdessen die erneute Verarbeitung der Daten aus.
        if (postBody === this.get("postBody")) {
            this.handleData();
            return;
        }

        this.setPostBody(postBody);
    },
    getDownloadAlertProperties: function () {
        return {
            category: "common:modules.alerting.categories.warning",
            confirmText: "common:button.download",
            content: i18next.t("common:modules.tools.pendler.general.attributionText"),
            displayClass: "warning",
            legacy_onConfirm: this.download.bind(this),
            mustBeConfirmed: true
        };
    },
    /**
     * Creates a confirmable alert with the csvDownloadConfirm text
     * @returns {void}
     */
    createAlertBeforeDownload: function () {
        Radio.trigger("Alert", "alert", this.getDownloadAlertProperties());
    },
    /**
     * downloads all line-features as csv file
     * @returns {void}
     */
    download: function () {
        const features = this.get("lineFeatures"),
            featurePropertyList = [];

        let csv = "",
            blob = "";

        features.forEach(feature => {
            featurePropertyList.push(Radio.request("Util", "omit", feature.getProperties(), ["geom_line"]));
        });
        csv = Radio.request("Util", "convertArrayOfObjectsToCsv", featurePropertyList);
        blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, "export.csv");
        }
        else {
            const link = document.createElement("a");

            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);

                link.setAttribute("href", url);
                link.setAttribute("download", "export.csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    },
    /**
     * Increases the zIndex of the layer with the given name, so it is readable.
     * @param {String} layerName name of the layer
     * @returns {void}
     */
    assertLayerOnTop: function (layerName) {
        const layers = Radio.request("Map", "getLayers").getArray().filter(layer => layer.get("name") === layerName);

        if (layers.length > 0) {
            let zIndex = layers[0].getZIndex();

            layers[0].setZIndex(++zIndex);

        }
    },

    /**
     * adds the label for the center of the lines/animations
     * @param {Function} getLabelText a function (ol/Feature) to get the text for the label with
     * @param {ol/Feature[]} features an array of ol/Feature - the first entry is used to determine the center point (using this.get("direction"))
     * @param {ol/layer/Vector} layer the layer to add the new feature to
     * @returns {void}
     */
    addCenterLabelToLayer: function (getLabelText, features, layer) {
        if (typeof getLabelText !== "function" || !Array.isArray(features)) {
            return;
        }
        const feature = features[0],
            coordinates = feature.getGeometry().getCoordinates(),
            // Ob die Features bei der Startposition oder der Endposition gezeichnet werden müssen,
            // ist abhängig von der Anzahl der Durchgänge
            drawIndex = this.get("direction") === "wohnort" ? 0 : coordinates.length - 1,
            currentPoint = new Point(coordinates[drawIndex]),
            newFeature = new Feature(currentPoint);

        // "styleId" neccessary for print, that style and feature can be linked
        newFeature.set("styleId", Radio.request("Util", "uniqueId"));
        newFeature.setStyle(new Style({
            text: new Text({
                text: getLabelText(feature),
                font: "10pt sans-serif",
                placement: "point",
                stroke: new Stroke({
                    color: [255, 255, 255, 0.9],
                    width: 5
                })
            })
        }));

        layer.getSource().addFeature(newFeature);
    },
    /**
     * adds the label to the ends of the lines/animations (not the center)
     * @param {String} labelText the label text to place
     * @param {ol/Feature} feature the ol/Feature - the placement is determined using coordinates of features and this.get("direction")
     * @param {ol/layer/Vector} layer the layer to add the new features to
     * @returns {void}
     */
    addLabelFeatureToLayer: function (labelText, feature, layer) {
        const coordinates = feature.getGeometry().getCoordinates(),
            drawIndex = this.get("direction") !== "wohnort" ? 0 : coordinates.length - 1,
            currentPoint = new Point(coordinates[drawIndex]),
            newFeature = new Feature(currentPoint);

        // "styleId" neccessary for print, that style and feature can be linked
        newFeature.set("styleId", Radio.request("Util", "uniqueId"));
        newFeature.setStyle(new Style({
            text: new Text({
                text: labelText,
                font: "10pt sans-serif",
                placement: "point",
                stroke: new Stroke({
                    color: [255, 255, 255, 0.9],
                    width: 5
                })
            })
        }));

        layer.getSource().addFeature(newFeature);
    },
    /**
     * adds lines (beams) into the given layer
     * @param {ol/Feature} feature the ol/Feature to place
     * @param {ol/layer/Vector} layer the layer to add the new features to
     * @param {Object} [styleOpt=null] an assignment to the stroke style
     * @returns {void}
     */
    addBeamFeatureToLayer: function (feature, layer, styleOpt = null) {
        // Erzeuge die Strahlen
        const newFeature = new Feature({
            geometry: feature.getGeometry()
        });

        newFeature.setStyle(new Style({
            stroke: new Stroke(Object.assign({
                color: [192, 9, 9, 1],
                width: "3"
            }, styleOpt))
        }));
        // "styleId" neccessary for print, that style and feature can be linked
        newFeature.set("styleId", Radio.request("Util", "uniqueId"));
        layer.getSource().addFeature(newFeature);
    },

    /**
     * zooms to the extent the given features are fitting in
     * @fires Core#RadioTriggerMapZoomToExtent
     * @param {ol/Feature[]} features an array of ol/Feature to calculate with
     * @pre the zoom of the ol map is somewhere
     * @post the zoom of the ol map is in an extent the given features are fitting in
     * @returns {void}
     */
    zoomToExtentOfFeatureGroup: function (features) {
        const extents = features.map(feature => {
                if (!(feature instanceof Feature)) {
                    return [];
                }
                return feature.getGeometry().getExtent();
            }),
            extent = this.getMaximumExtentOfGroupOfExtents(extents);

        if (extent) {
            Radio.trigger("Map", "zoomToExtent", extent, {padding: [20, 20, 20, 400]});
        }
    },
    /**
     * calculates the maximum extent to fit all the given extents into
     * @param {Array[]} extents an array of an array of numbers to calculate with
     * @returns {Number[]}  an array of 4 numbers as maximum extent or null if no extent could be calculated
     */
    getMaximumExtentOfGroupOfExtents: function (extents) {
        let result = null;

        if (!Array.isArray(extents)) {
            return null;
        }
        extents.forEach(extent => {
            if (!result) {
                result = extent;
            }
            else {
                olExpandExtent(result, extent);
            }
        });

        return result;
    },

    /**
     * resets the window by unsetting 'kreis', 'pendlerLegend' and 'postbody'
     * @returns {void}
     */
    resetWindow: function () {
        this.setKreis("");
        this.set("pendlerLegend", []);
        this.unset("postBody", {silent: true});
    },
    /**
     * Sets the body of the post request
     * @param {String} value body of the post request
     * @returns {void}
     */
    setPostBody: function (value) {
        this.set("postBody", value);
    },
    /**
     * Sets the line features
     * @param {Feature[]} value body of the post request
     * @returns {void}
     */
    setLineFeatures: function (value) {
        this.set("lineFeatures", value);
    },
    /**
     * Sets the url
     * @param {String} value url
     * @returns {void}
     */
    setUrl: function (value) {
        this.set("url", value);
    },
    /**
     * Sets the params for a request
     * @param {Object} value params
     * @returns {void}
     */
    setParams: function (value) {
        this.set("params", value);
    },
    /**
     * Sets the feature type
     * @param {String} value type of a feature
     * @returns {void}
     */
    setFeatureType: function (value) {
        this.set("featureType", value);
    },
    /**
     * Sets the attribute for 'Anzahl'
     * @param {String} value the attribute name
     * @returns {void}
     */
    setAttrAnzahl: function (value) {
        this.set("attrAnzahl", value);
    },
    /**
     * Sets the attribute for 'Gemeinde'
     * @param {String} value the attribute name
     * @returns {void}
     */
    setAttrGemeinde: function (value) {
        this.set("attrGemeinde", value);
    },
    /**
     * Sets the attribute for 'GemeindeContrary'
     * @param {String} value the attribute name
     * @returns {void}
     */
    setAttrGemeindeContrary: function (value) {
        this.set("attrGemeindeContrary", value);
    },
    /**
     * Sets the 'Landkreise'
     * @param {String[]} value names of the 'Landkreise'
     * @returns {void}
     */
    setKreise: function (value) {
        this.set("kreise", value);
    },
    /**
     * Sets the 'Landkreis'
     * @param {String} value name of the 'Landkreis'
     * @returns {void}
     */
    setKreis: function (value) {
        this.set("kreis", value);
    },
    /**
     * Sets a list of 'Gemeinde'
     * @param {String[]} value names of the 'Gemeinde'
     * @returns {void}
     */
    setGemeinden: function (value) {
        this.set("gemeinden", value);
    },
    /**
     * Sets the 'Gemeinde'
     * @param {String} value name of the 'Gemeinde'
     * @returns {void}
     */
    setGemeinde: function (value) {
        this.set("gemeinde", value);
    },
    /**
     * Sets the amount of hits
     * @param {String} value hit count
     * @returns {void}
     */
    setTrefferAnzahl: function (value) {
        this.set("trefferAnzahl", value);
    },
    /**
     * Sets the direction 'Wohnort' or 'Arbeitsort'
     * @param {String} value the direction
     * @returns {void}
     */
    setDirection: function (value) {
        this.set("direction", value);
    },
    /**
     * Sets the zoomlevel
     * @param {Number} value the level
     * @returns {void}
     */
    setZoomLevel: function (value) {
        this.set("zoomLevel", value);
    }
});

export default PendlerCoreModel;
