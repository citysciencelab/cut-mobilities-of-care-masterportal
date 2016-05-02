define([
    "backbone",
    "backbone.radio",
    "config",
    "eventbus",
    "modules/core/util"
], function (Backbone, Radio, Config, EventBus, Util) {
    "use strict";
    var RestList = Backbone.Collection.extend({
        url: Util.getPath(Config.restConf),
        initialize: function () {
            var channel = Radio.channel("RestReader");

            channel.reply({
                "getAllServices": this.getAllServices,
                "getServiceById": this.getServiceById
            }, this);

            this.fetch({
                cache: false,
                error: function () {
                    EventBus.trigger("alert", {
                        text: "Fehler beim Laden von: " + Util.getPath(Config.restConf),
                        kategorie: "alert-warning"
                    });
                }
            });
        },
        getAllServices: function () {
            return this.models;
        },
        getServiceById: function (id) {
            return this.where({id: id});
        }
    });

    return RestList;
});
