define([
    "backbone",
    "modules/treeconfig/model",
    "config",
    "eventbus"
], function (Backbone, Model, Config, EventBus) {

    //interpretiere Pfade relativ von requirejs baseurl, es sei denn, er beginnt mit einem '/'
    var baseUrl = require.toUrl("").split("?")[0];
    if (Config.layerConf.indexOf("/") == 0){
        baseUrl = "";
    }

    var list = Backbone.Collection.extend({
        url: baseUrl + Config.tree.customConfig,
        model: Model,

        /**
         * Registriert die Events "getCustomNodes" und "fetchTreeConfig".
         * Ruft initial die Funktion "fetchTreeConfig" auf.
         */
        initialize: function () {
            EventBus.on("getCustomNodes", this.sendCustomNodes, this);
            EventBus.on("fetchTreeConfig", this.fetchTreeConfig, this);
            this.fetchTreeConfig();
        },

        /**
         * Holt sich die gewünschte Tree-Konfiguration (Config.tree.orderBy).
         * Überschreibt die Config.layerIDs mit den Layern der Tree-Konfiguration.
         */
        fetchTreeConfig: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert("Fehler beim Laden von:" + Config.tree.orderBy + ".json");
                },
                success: function (collection) {
                    Config.layerIDs = _.flatten(collection.pluck("layers"));
                }
            });
        },

        /**
         * Feuert das Event "sendCustomNodes" ab.
         * Übergibt aus allen Models die Werte aus dem Attribute "node" als Array.
         */
         sendCustomNodes: function () {
            EventBus.trigger("sendCustomNodes", this.pluck("node"));
        }
    });

    return list;
});
