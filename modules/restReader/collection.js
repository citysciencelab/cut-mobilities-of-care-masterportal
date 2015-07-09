define([
    "backbone",
    "config",
    "eventbus",
    "modules/core/util",
    "modules/restReader/model",
    ], function (Backbone, Config, EventBus, Util, Model) {
    "use strict";
    var RestList = Backbone.Collection.extend({
        url: Util.getPath(Config.restConf),
        model: Model,
        initialize: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Laden von: " + Util.getPath(Config.restConf));
                },
                success: function (collection) {
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

    return new RestList();
});
