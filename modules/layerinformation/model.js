define(function (require) {
    var ViewMobile = require("modules/layerinformation/viewMobile"),
        View = require("modules/layerinformation/view"),
        $ = require("jquery"),
        moment = require("moment"),
        LayerInformation;

    LayerInformation = Backbone.Model.extend({
        defaults: {
            // konfiguriert in der rest-services.json
            cswId: "3",
            // true wenn die Layerinformation sichtbar ist
            isVisible: false
        },

        /**
         * Gibt die Url aus der rest-services.json passend zu "cswId" zurück
         * @return {String} - CSW GetRecordById Request-String
         */
        url: function () {
            var cswService = Radio.request("RestReader", "getServiceById", this.get("cswId")),
                url = "undefined";

            if (_.isUndefined(cswService) === false) {
                url = Radio.request("Util", "getProxyURL", cswService.get("url"));
            }
            return url;
        },

        initialize: function () {
            var channel = Radio.channel("LayerInformation");

            this.listenTo(channel, {
                "add": function (attrs) {
                    this.setAttributes(attrs);
                    this.setIsVisible(true);
                }
            });

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": function (isMobile) {
                    this.trigger("removeView");
                    this.bindView(isMobile);
                }
            });
            this.bindView(Radio.request("Util", "isViewMobile"));
        },

        bindView: function (isMobile) {
            var currentView;

            if (isMobile === true) {
                currentView = new ViewMobile({model: this});
            }
            else {
                currentView = new View({model: this});
            }
            if (this.get("isVisible") === true) {
                currentView.render();
            }
        },

        /**
         * Wird über Trigger vom Layer gestartet und übernimmt die Attribute zur Darstellung
         * @param {object} attrs Objekt mit Attributen zur Darstellung
         * @fires sync#render-Funktion
         * @returns {void}
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
                this.set("metaURL", null);
                this.set("downloadLinks", null);
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
            var layername = this.get("layername");

            return {
                "abstractText": function () {
                    var abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0].textContent;

                    if (abstractText.length > 1000) {
                        return abstractText.substring(0, 600) + "...";
                    }

                    return abstractText;

                }(),
                "date": function () {
                    var citation = $("gmd\\:citation,citation", xmlDoc),
                        dates = $("gmd\\:CI_Date,CI_Date", citation),
                        datetype, revisionDateTime, publicationDateTime, dateTime;

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
                }(),
                "downloadLinks": function () {
                    var transferOptions = $("gmd\\:MD_DigitalTransferOptions,MD_DigitalTransferOptions", xmlDoc),
                        downloadLinks = [],
                        linkName,
                        link,
                        datetype;

                    transferOptions.each(function (index, element) {
                        datetype = $("gmd\\:CI_OnLineFunctionCode,CI_OnLineFunctionCode", element);
                        if ($(datetype).attr("codeListValue") === "download") {
                            linkName = $("gmd\\:name,name", element)[0].textContent;
                            if (linkName.indexOf("Download") !== -1) {
                                linkName = linkName.replace("Download", "");
                            }
                            link = $("gmd\\:URL,URL", element)[0].textContent;
                            downloadLinks.push([linkName, link]);
                        }
                    });
                    return downloadLinks.length > 0 ? downloadLinks : null;
                }()
            };
        },

        /**
         * Wertet das Array der der metaIDs aus und erzeugt Array metaURL mit vollständiger URL für Template, ohne Doppelte Einträge zuzulassen
         * @returns {void}
         */
        setMetadataURL: function () {
            var metaURLs = [],
                metaURL = "";

            _.each(this.get("metaID"), function (metaID) {
                if (this.url().search("metaver") !== -1) {
                    metaURL = "http://metaver.de/trefferanzeige?docuuid=" + metaID;
                }
                else if (this.url().search("geodatenmv.de") !== -1) {
                    metaURL = "http://www.geodaten-mv.de/geomis/Query/ShowCSWInfo.do?fileIdentifier=" + metaID;
                }
                else {
                    metaURL = "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + metaID;
                }
                if (metaID !== "" && !_.contains(metaURLs, metaURL)) {
                    metaURLs.push(metaURL);
                }
            }, this);
            this.set("metaURL", metaURLs);
        },

        setIsVisible: function (value) {
            this.set("isVisible", value);
        }
    });

    return LayerInformation;
});
