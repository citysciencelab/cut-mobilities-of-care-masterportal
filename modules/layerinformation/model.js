define([
    "backbone",
    "backbone.radio",
    "eventbus",
    "config",
    "moment",
    "modules/core/util"
], function (Backbone, Radio, EventBus, Config, moment, Util) {

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
                return Util.getProxyURL(resp[0].get("url"));
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
            if (!_.isUndefined(this.get("metaID"))) {
                this.fetchData({id: this.get("metaID")});
            }
            else {
                this.trigger("sync");
            }
        },

        fetchData: function (data) {
            Util.showLoader();
            this.fetch({
                data: data,
                dataType: "xml",
                error: function () {
                    Util.hideLoader();
                    EventBus.trigger("alert", {
                        text: "Informationen zurzeit nicht verfügbar",
                        kategorie: "alert-warning"
                    });
                },
                success: function () {
                    Util.hideLoader();
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
                    var dates = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", xmlDoc),
                        dateTime;

                    if (dates.length === 1) {
                        dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", xmlDoc)[0].textContent;
                    }
                    else {
                        dates.each(function (index, element) {
                            if ($(element).attr("codeListValue") === "revision") {
                                dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", xmlDoc)[index].textContent;
                            }
                        });
                    }

                    return moment(dateTime).format("DD.MM.YYYY");
                }()
            };
        },

        setMetadataURL: function () {
            if (this.url().search("metaver") !== -1) {
                this.set("metaURL", "http://metaver.de/trefferanzeige?docuuid=" + this.get("metaID"));
            }
            else {
                this.set("metaURL", "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.get("metaID"));
            }
        }
    });

    return LayerInformation;
});
