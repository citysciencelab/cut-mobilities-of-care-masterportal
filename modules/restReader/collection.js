define([
    "backbone",
    "backbone.radio",
    "config"
], function (Backbone, Radio, Config) {
    "use strict";
    var RestList = Backbone.Collection.extend({
        url: function () {
            return Radio.request("Util", "getPath", Config.restConf);
        },
        initialize: function () {
            var channel = Radio.channel("RestReader");

            channel.reply({
                "getAllServices": this.getAllServices,
                "getServiceById": this.getServiceById
            }, this);

            this.fetch({
                cache: false,
                async: false,
                success: function () {
                    channel.trigger("isReady", true);
                },
                error: function () {
                    Radio.trigger("Alert", "alert", {
                        text: "Fehler beim Laden von: " + Radio.request("Util", "getPath", Config.restConf),
                        kategorie: "alert-warning"
                    });
                }
            });
        },
        getAllServices: function () {
            return this.models;
        },
        getServiceById: function (id) {
            return this.findWhere({id: id});
        }
    });

    return RestList;
});
