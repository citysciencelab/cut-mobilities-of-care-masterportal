define([
    "backbone",
    "backbone.radio",
    "config",
    "modules/core/util",
    "eventbus"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        EventBus = require("eventbus"),
        Util = require("modules/core/util"),
        RawLayerList;

    RawLayerList = Backbone.Collection.extend({
        url: Util.getPath(Config.layerConf),
        initialize: function () {
            var channel = Radio.channel("RawLayerList");

            channel.reply({
                "getLayerList": this.getLayerList,
                "getLayerListWhere": this.getLayerListWhere
            }, this);

            channel.on({
                "addModelToLayerListById": this.addModelToLayerListById
            }, this);

            this.fetch({
                error: function () {
                    EventBus.trigger("alert", {
                        text: "Fehler beim Laden von: " + Util.getPath(Config.layerConf),
                        kategorie: "alert-warning"
                    });
                }
            });
        },

        /**
         * Liefert ein Array mit den Attributen aller Models zurück, die in der Collection vorhanden sind.
         */
        getLayerList: function () {
            return this.toJSON();
        },

        /**
         * Liefert ein Array aller Models zurück, die mit den übergebenen Attributen übereinstimmen.
         */
        getLayerListWhere: function (attributes) {
            return this.where(attributes);
        },

        /**
         * Holt sich das Model anhand der ID aus der Collection, setzt visibility auf true
         * und übergibt die Model Attribute als JSON an modules/layer/list.
         */
        addModelToLayerListById: function (id) {
            var model = this.get(id);

            model.set("visibility", true);
            Radio.trigger("LayerList", "addModel", model.toJSON());
        }
    });

    return RawLayerList;
});
