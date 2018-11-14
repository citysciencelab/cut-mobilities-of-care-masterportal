import Tool from "../../../core/modelList/tool/model";
import {WFS} from "ol/format.js";

const PendlerCoreModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        kreis: "",
        pendlerLegend: [],
        renderToWindow: true,
        zoomLevel: 1,
        url: "http://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
        params: {
            REQUEST: "GetFeature",
            SERVICE: "WFS",
            TYPENAME: "app:mrh_kreise",
            VERSION: "1.1.0",
            maxFeatures: "10000"
        },
        featureType: "mrh_einpendler_gemeinde",
        attrAnzahl: "anzahl_einpendler",
        attrGemeinde: "wohnort"
    }),
    initialize: function () {
        var channel = Radio.channel("Animation");

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
                this.clear();
                if (value === "arbeitsort") {
                    this.setAttrGemeinde("wohnort");
                }
                else {
                    this.setAttrGemeinde("arbeitsort");
                }
                this.createPostBody(value);
            },
            "change:postBody": function (model, value) {
                this.sendRequest("POST", value, this.parseFeatures);
            }
        });
        this.sendRequest("GET", this.get("params"), this.parseKreise);
    },

    /**
     * Führt einen HTTP-Request aus
     * @param {String} type - GET oder POST
     * @param {String} data -
     * @param {function} successFunction - Wird aufgerufen wenn der Request erfolgreich war
     * @returns {void}
     */
    sendRequest: function (type, data, successFunction) {
        $.ajax({
            url: Radio.request("Util", "getProxyURL", this.get("url")),
            data: data,
            contentType: "text/xml",
            type: type,
            context: this,
            success: successFunction,
            error: function (jqXHR, errorText, error) {
                Radio.trigger("Alert", "alert", error);
            }
        });
    },

    /**
     * Übergibt die Zentrumskoordinate der Gemeinde an die MapView, abhängig der Richtung.
     * @param {bool} setMarker Wenn "true" wir ein Marker gesetzt.
     * @returns {void}
     */
    centerGemeinde: function (setMarker) {
        var coords = [];

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
        var kreise = [],
            hits = $("gml\\:featureMember,featureMember", data);

        _.each(hits, function (hit) {
            var kreis = $(hit).find("app\\:kreisname,kreisname")[0].textContent;

            kreise.push(kreis);
        });

        this.setKreise(_.without(kreise.sort(), "Bremen", "Berlin", "Kiel", "Hannover"));
    },

    /**
     * Success Funktion für die Gemeinden
     * @param  {ojbect} data - Response
     * @returns {void}
     */
    parseGemeinden: function (data) {
        var gemeinden = [],
            hits = $("wfs\\:member,member", data);

        _.each(hits, function (hit) {
            var gemeinde = $(hit).find("app\\:gemeinde,gemeinde")[0].textContent;

            gemeinden.push(gemeinde);
        });
        this.setGemeinden(gemeinden.sort());
    },

    /**
     * Success Funktion für die Features
     * @param  {ojbect} data - Response
     * @returns {void}
     */
    parseFeatures: function (data) {
        var wfsReader = new WFS({
            featureNS: "http://www.deegree.org/app",
            featureType: this.get("featureType")
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
        var limit;

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
        return _.first(features, limit);
    },

    /**
     * Sortieren der Features nach Pendler-Anzahl sowie Abschneiden der Liste gemäß der Top-Angabe.
     * @param {Object[]} rawFeatures Feature-Liste
     * @returns {Object[]} Stortierte und Abgeschnittene Feature-Liste
     */
    selectFeatures: function (rawFeatures) {
        var sortedFeatures,
            relevantFeatures;

        // Sortiere nach Anzahl der Pendler
        sortedFeatures = _.sortBy(rawFeatures, function (feature) {
            // Verwende die Gegenzahl als Wert zur Sortierung, um absteigende Reihenfolge zu erhalten.
            return feature.get(this.get("attrAnzahl")) * -1;
        }, this);

        // Schneide Liste gemäß gewähltem Top ab
        relevantFeatures = this.truncateFeatureList(sortedFeatures, this.get("trefferAnzahl"));

        return relevantFeatures;
    },

    /**
     * Bereite den Inhalt der Abfrage an den WFS vor.
     * @param {String} value Abzufragender Schlüssel (im Falle des Pendler-Tools: "Wohnort" oder "Arbeitsplatz")
     * @returns {Void} Kein Rückgabewert
     */
    createPostBody: function (value) {
        var postBody = "<?xml version='1.0' encoding='UTF-8' ?>" +
                        "<wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc'>" +
                            "<wfs:Query typeName='app:" + this.get("featureType") + "'>" +
                                "<ogc:Filter>" +
                                    "<ogc:PropertyIsEqualTo>" +
                                        "<ogc:PropertyName>app:" + value + "</ogc:PropertyName>" +
                                        "<ogc:Literal>" + this.get("gemeinde") + "</ogc:Literal>" +
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

    download: function () {
        const features = this.get("lineFeatures"),
            featurePropertyList = [];

        let csv = "",
            blob = "";

        features.forEach(function (feature) {
            featurePropertyList.push(_.omit(feature.getProperties(), "geom_line"));
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

    setPostBody: function (value) {
        this.set("postBody", value);
    },
    setLineFeatures: function (value) {
        this.set("lineFeatures", value);
    },
    setUrl: function (value) {
        this.set("url", value);
    },
    setParams: function (value) {
        this.set("params", value);
    },
    setFeatureType: function (value) {
        this.set("featureType", value);
    },
    setAttrAnzahl: function (value) {
        this.set("attrAnzahl", value);
    },
    setAttrGemeinde: function (value) {
        this.set("attrGemeinde", value);
    },
    setKreise: function (value) {
        this.set("kreise", value);
    },
    setKreis: function (value) {
        this.set("kreis", value);
    },
    setGemeinden: function (value) {
        this.set("gemeinden", value);
    },
    setGemeinde: function (value) {
        this.set("gemeinde", value);
    },
    setTrefferAnzahl: function (value) {
        this.set("trefferAnzahl", value);
    },
    setDirection: function (value) {
        this.set("direction", value);
    },
    setZoomLevel: function (value) {
        this.set("zoomLevel", value);
    },
    resetWindow: function () {
        this.setKreis("");
        this.set("pendlerLegend", []);
        this.unset("postBody", {silent: true});
    }
});

export default PendlerCoreModel;
