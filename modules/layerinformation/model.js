define([
    "backbone",
    "eventbus",
    "config",
    "modules/restReader/collection",
    "moment",
    "modules/core/util"
], function (Backbone, EventBus, Config, RestReader, moment, Util) {

    var LayerInformation = Backbone.Model.extend({
        url: function () {
            var resp = RestReader.getServiceById(Config.csw.id);

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
            this.fetch({
                data: data,
                dataType: "xml",
                error: function () {
                    EventBus.trigger("alert", {
                        text: "Informationen zurzeit nicht verfügbar",
                        kategorie: "alert-warning"
                    });
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
                    var date = $("gmd\\:dateStamp,dateStamp", xmlDoc)[0].textContent;

                    return moment(date).format("DD.MM.YYYY");
                }()
            };
        }
    });

    return LayerInformation;
});
