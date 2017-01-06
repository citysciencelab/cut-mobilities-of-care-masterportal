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

        setAttributes: function (attrs) {
            this.set(attrs);
            this.setMetadataURL();
            if (!_.isNull(this.get("metaID"))) {
                this.fetchData({id: this.get("metaID")});
            }
            else {
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
                    datetype,revisionDateTime,publicationDateTime,
                    dateTime;

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
                }()
            };
        },

        setMetadataURL: function () {
            if (this.url().search("metaver") !== -1) {
                this.set("metaURL", "http://metaver.de/trefferanzeige?docuuid=" + this.get("metaID"));
            }
            else if (this.url().search("geodatenmv.de") !== -1) {
                this.set("metaURL", "http://www.geodaten-mv.de/geomis/Query/ShowCSWInfo.do?fileIdentifier=" + this.get("metaID"));
            }
            else {
                this.set("metaURL", "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.get("metaID"));
            }
        }
    });

    return LayerInformation;
});
