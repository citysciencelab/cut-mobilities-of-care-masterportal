define( function (require) {

    var WFSStyle = require("../vectorStyle/model"),
        Config = require("config"),
        StyleList;

        StyleList = Backbone.Collection.extend ({
        model: WFSStyle,
        url: function () {
            if (!_.has(Config, "styleConf") || Config.styleConf === "") {
                return "keine Style JSON";
            }
            return Radio.request("Util", "getPath", Config.styleConf);
        },
        initialize: function () {
            var channel = Radio.channel("StyleList");

            channel.reply({
                "returnModelById": this.returnModelById,
                "returnModels": function () {
                    return this.models;
                }
            }, this);

            if (this.url() !== "keine Style JSON") {
                this.fetch({
                    cache: false,
                    async: false,
                    error: function () {
                        Radio.trigger("Alert", "alert", {
                            text: "Fehler beim Laden von: " + Radio.request("Util", "getPath", Config.styleConf),
                            kategorie: "alert-warning"
                        });
                    },
                    success: function () {
                    }
                });
            }
        },
        returnModelById: function (layerId) {
            return _.find(this.models, function (slmodel) {
                if (slmodel.attributes.layerId === layerId) {
                    return slmodel;
                }
            });
        }
    });

    return StyleList;
});
