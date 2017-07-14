define([
    "backbone",
    "backbone.radio",
    "config",
    "moment"
], function (Backbone, Radio, Config, moment) {

    var LayerInformation = Backbone.Model.extend({
        defaults: {
            cswID: "1"
        },

        url: function () {
            var resp;

            if (_.has(Config, "csw")) {
                resp = Radio.request("RestReader", "getServiceById", Config.csw.id);
            }
            else {
                resp = Radio.request("RestReader", "getServiceById", this.get("cswID"));
            }

            if (resp[0] && resp[0].get("url")) {
                return Radio.request("Util", "getProxyURL", resp[0].get("url"));
            }
        },
        initialize: function () {
            var channel = Radio.channel("LayerInformation");

            channel.on({
                "add": this.setAttributes
            }, this);
        },

        /**
         * Wird über Trigger vom Layer gestartet und übernimmt die Attribute zur Darstellung
         * @param {object} attrs Objekt mit Attributen zur Darstellung
         * @fires sync#render-Funktion
         */
        setAttributes: function (attrs) {
            this.set(attrs);
            this.setMetadataURL();
            if (!_.isNull(this.get("metaID")[0])) {
                this.fetchData({id: this.get("metaID")[0]});
            }
            else {
                this.set("title", this.get("layername"));
                this.set("abstractText", "Keine Metadaten vorhanden.");
                this.set("date", null);
                this.trigger("sync");
            }
        },

        fetchData: function (data) {
            Radio.trigger("Util", "showLoader");
            this.fetch({
                data: data,
                dataType: "xml",
                error: function () {
                    Radio.trigger("Util", "hideLoader");
                    Radio.trigger("Alert", "alert", {
                        text: "Informationen zurzeit nicht verfügbar",
                        kategorie: "alert-warning"
                    });
                },
                success: function () {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },

        parse: function (xmlDoc) {
            var layername = this.get("layername"); // CI_Citation fall-back-level

            return {
                "abstractText": function () {
                    var abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0].textContent;

                    if (abstractText.length > 1000) {
                        return abstractText.substring(0, 600) + "...";
                    }
                    else {
                        return abstractText;
                    }
                }(),
                "date": function () {

                    var dates = $("gmd\\:CI_Date,CI_Date", xmlDoc),
                        datetype, revisionDateTime, publicationDateTime, dateTime;

                    if (dates.length === 1) {
                        dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", dates)[0].textContent;
                    }
                    else {
                        dates.each(function (index, element) {
                            datetype = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", element);
                            if ($(datetype).attr("codeListValue") === "revision") {
                                revisionDateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                            }
                            else if ($(datetype).attr("codeListValue") === "publication") {
                                publicationDateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                            }
                            else {
                                dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                            }
                        });
                    }
                    if (revisionDateTime) {
                        dateTime = revisionDateTime;
                    }
                    else if (publicationDateTime) {
                        dateTime = publicationDateTime;
                    }
                    return moment(dateTime).format("DD.MM.YYYY");
                }(),
                "title": function () {
                    var ci_Citation = $("gmd\\:CI_Citation,CI_Citation", xmlDoc)[0],
                        gmdTitle = _.isUndefined(ci_Citation) === false ? $("gmd\\:title,title", ci_Citation) : undefined,
                        title = _.isUndefined(gmdTitle) === false ? gmdTitle[0].textContent : layername;

                    return title;
                }()
            };
        },

        /**
         * Wertet das Array der der metaIDs aus und erzeugt Array metaURL mit vollständiger URL für Template, ohne Doppelte Einträge zuzulassen
         */
        setMetadataURL: function () {
            var metaURLs = [],
                metaIDs = this.get("metaID"),
                url = this.url(),
                metaURL = "";

            _.each(metaIDs, function (metaID) {
                if (url.search("metaver") !== -1) {
                    metaURL = "http://metaver.de/trefferanzeige?docuuid=" + metaID;
                }
                else if (url.search("geodatenmv.de") !== -1) {
                    metaURL = "http://www.geodaten-mv.de/geomis/Query/ShowCSWInfo.do?fileIdentifier=" + metaID;
                }
                else {
                    metaURL = "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + metaID;
                }
                if (metaID !== "" && !_.contains(metaURLs, metaURL)) {
                    metaURLs.push(metaURL);
                }
            });
            this.set("metaURL", metaURLs);
        }
    });

    return LayerInformation;
});
