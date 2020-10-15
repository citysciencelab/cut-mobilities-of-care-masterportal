import Tool from "../../../core/modelList/tool/model";
import {WFS} from "ol/format.js";

const PendlerCoreModel = Tool.extend(/** @lends PendlerCoreModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        kreis: "",
        kreise: [],
        pendlerLegend: [],
        renderToWindow: true,
        zoomLevel: 1,
        url: "https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
        params: {
            REQUEST: "GetFeature",
            SERVICE: "WFS",
            TYPENAME: "app:mrh_kreise",
            VERSION: "1.1.0",
            maxFeatures: "10000"
        },
        singleCounties: [
            "Hamburg",
            "Lübeck",
            "Neumünster",
            "Schwerin"
        ],
        wfsappGemeinde: "mrh_einpendler_gemeinde",
        wfsappKreise: "mrh_pendler_kreise",
        featureType: "mrh_pendler_kreise",
        attrAnzahl: "anzahl_einpendler",
        attrGemeinde: "wohnort",
        alertId: "",
        attributionText: "<b>Die Daten dürfen nicht für gewerbliche Zwecke genutzt werden.</b><br>" +
            "Quelle: Bundesagentur für Arbeit - <a href='https://statistik.arbeitsagentur.de/' target='_blank'>https://statistik.arbeitsagentur.de/</a>"
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
     * @property {String} url= "https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung" url to get the 'pendlerverflechtung' from
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
     * @property {String} alertId="" id of an alert before download
     * @property {String} attributionText="<b>Die Daten dürfen nicht für gewerbliche Zwecke genutzt werden.</b><br>" +
            "Quelle: Bundesagentur für Arbeit - <a href='https://statistik.arbeitsagentur.de/' target='_blank'>https://statistik.arbeitsagentur.de/</a>" text to show as an attribution
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
                    Radio.trigger("Attributions", "createAttribution", model.get("name"), this.get("attributionText"), "Pendler");
                }
                else {
                    Radio.trigger("Attributions", "removeAttribution", model.get("name"), this.get("attributionText"), "Pendler");
                }
            }
        });

        this.listenTo(this, {
            "change:kreis": function (model, value) {
                this.unset("gemeinde");
                this.unset("direction", {silent: true});
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
            "change:gemeinde": function () {
                this.unset("trefferAnzahl", {silent: true});
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
                }
                else {
                    this.setAttrGemeinde("arbeitsort");
                }

                const mutatedFeatureType = this.mutateFeatureTypeForSingleCounties(
                        this.get("kreis"),
                        this.get("singleCounties"),
                        this.get("featureType"),
                        this.get("wfsappKreise"),
                        this.get("wfsappGemeinde")
                    ),
                    literal = this.get("featureType") === this.get("wfsappGemeinde") ? this.get("gemeinde") : this.get("kreis");

                this.createPostBody(mutatedFeatureType, value, literal);
            },
            "change:postBody": function (model, value) {
                this.sendRequest("POST", value, data => {
                    const mutatedFeatureType = this.mutateFeatureTypeForSingleCounties(
                        this.get("kreis"),
                        this.get("singleCounties"),
                        this.get("featureType"),
                        this.get("wfsappKreise"),
                        this.get("wfsappGemeinde")
                    );

                    this.parseFeatures(data, mutatedFeatureType);
                });
            }
        });
        this.listenTo(Radio.channel("Alert"), {
            "confirmed": function (id) {
                if (id === this.get("alertId")) {
                    this.download();
                }
                this.setAlertId("");
            }
        });
        this.sendRequest("GET", this.get("params"), this.parseKreise);
    },

    /**
     * as bigger towns have no smaller communities, the data for bigger towns are not available through wfsappKreise
     * but only through wfsappGemeinde. This is unfortunate and needs a special handling.
     * @param {String} county the choosen county ("kreis")
     * @param {String[]} singleCounties the county to get the special handling for - as simple array of strings
     * @param {String} featureType the choosen app (wfsappKreise or wfsappGemeinde)
     * @param {String} wfsappKreise the value for featureType (app) "kreis" - passed to avoid global access
     * @param {String} wfsappGemeinde the value for featureType (app) "gemeinde" - passed to avoid global access
     * @returns {String} the featureType to use for the wfs request either wfsappKreise or wfsappGemeinde
     */
    mutateFeatureTypeForSingleCounties: function (county, singleCounties, featureType, wfsappKreise, wfsappGemeinde) {
        if (featureType === wfsappKreise && Array.isArray(singleCounties) && singleCounties.indexOf(county) !== -1) {
            return wfsappGemeinde;
        }
        return featureType;
    },

    /**
     * Führt einen HTTP-Request aus
     * @param {String} type - GET oder POST
     * @param {String} data - data to send
     * @param {function} successFunction - Wird aufgerufen wenn der Request erfolgreich war
     * @returns {void}
     */
    sendRequest: function (type, data, successFunction) {
        const url = this.get("url");

        $.ajax({
            url: Radio.request("Util", "getProxyURL", url),
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
            Radio.trigger("MapMarker", "showMarker", coords);
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
    /**
     * Creates a confirmable alert with the 'attributionText'
     * @returns {void}
     */
    createAlertBeforeDownload: function () {
        const alertId = "PendlerDownload";

        this.setAlertId(alertId);
        Radio.trigger("Alert", "alert", {
            id: alertId,
            text: this.get("attributionText"),
            dismissable: false,
            confirmable: true
        });
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
    },
    /**
     * Sets the id of the alert
     * @param {String} value alert-id
     * @returns {void}
     */
    setAlertId: function (value) {
        this.set("alertId", value);
    }
});

export default PendlerCoreModel;
