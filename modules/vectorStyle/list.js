define([
    "backbone",
    "modules/vectorStyle/model",
    "config",
    "backbone.radio"
], function (Backbone, WFSStyle, Config, Radio) {

    var StyleList = Backbone.Collection.extend ({
        model: WFSStyle,
        url: function () {
            return Radio.request("Util", "getPath", Config.styleConf);
        },
        initialize: function () {
            var channel = Radio.channel("StyleList");

            channel.reply({
                "returnModelById": this.returnModelById,
                "returnAllModelsById": this.returnAllModelsById,
                "returnModelByValue": this.returnModelByValue,
                "returnModels": function () {
                    return this.models;
                }
            }, this);

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
        },
        returnAllModelsById: function (layerId) {
            return _.filter(this.models, function (slmodel) {
                if (slmodel.attributes.layerId === layerId) {
                    return slmodel;
                }
            });
        },
        returnModelById: function (layerId) {
            return _.find(this.models, function (slmodel) {
                if (slmodel.attributes.layerId === layerId) {
                    return slmodel;
                }
            });
        },
        returnModelByValue: function (layerId, styleFieldValue) {
            return _.find(this.models, function (slmodel) {
                if (slmodel.attributes.layerId === layerId && slmodel.attributes.styleFieldValue === styleFieldValue) {
                    return slmodel;
                }
            });
        }
    });

    return StyleList;
});
