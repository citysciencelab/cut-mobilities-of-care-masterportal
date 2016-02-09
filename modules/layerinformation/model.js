define([
    "backbone",
    "eventbus",
    "config",
    "modules/restReader/collection",
    "moment",
    "modules/core/util"
], function (Backbone, EventBus, Config, RestReader, moment, Util) {

    var LayerInformation = Backbone.Model.extend({
        defaults: {
            cswID: "1"
        },

        url: function () {
            var resp;

            if (_.has(Config, "csw")) {
                resp = RestReader.getServiceById(Config.csw.id);
            }
            else {
                resp = RestReader.getServiceById(this.get("cswID"));
            }

            if (resp[0] && resp[0].get("url")) {
                return Util.getProxyURL(resp[0].get("url"));
            }
        },
        initialize: function () {
            this.listenTo(EventBus, {
                "layerinformation:add": this.setAttributes
            });
        },

        setAttributes: function (attrs) {
            this.set(attrs);
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
                        dateTime = $("gco\\:DateTime,DateTime", xmlDoc)[0].textContent;
                    }
                    else {
                        dates.each(function (index, element) {
                            if ($(element).attr("codeListValue") === "revision") {
                                dateTime = $("gco\\:DateTime,DateTime", xmlDoc)[index].textContent;
                            }
                        });
                    }

                    return moment(dateTime).format("DD.MM.YYYY");
                }()
            };
        }
    });

    return LayerInformation;
});
