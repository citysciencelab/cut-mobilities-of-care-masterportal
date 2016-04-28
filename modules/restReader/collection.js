define([
    "backbone",
    "config",
    "eventbus",
    "modules/core/util"
    ], function (Backbone, Config, EventBus, Util) {
    "use strict";
    var RestList = Backbone.Collection.extend({
        url: Util.getPath(Config.restConf),
        initialize: function () {
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
        getAllServices: function () {console.log(this.models);
            return this.models;
        },
        getServiceById: function (id) {
            return this.where({id: id});
        }
    });

    return new RestList();
});
