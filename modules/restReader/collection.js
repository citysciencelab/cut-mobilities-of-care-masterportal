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
            EventBus.on("wantAllRestReaderServices", this.wantAllRestReaderServices, this);
            EventBus.on("wantRestReaderServiceByID", this.wantRestReaderServiceByID, this);
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
        },
        wantRestReaderServiceByID: function (id) {
            EventBus.trigger("sendRestReaderServiceByID", this.getServiceById(id));
        },
        wantAllRestReaderServices: function () {
            EventBus.trigger("sendAllRestReaderServices", this.getAllServices());
        }
    });

    return new RestList();
});
