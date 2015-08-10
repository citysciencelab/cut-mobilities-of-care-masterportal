define([
    "backbone",
    "modules/treeconfig/model",
    "config",
    "eventbus",
    "modules/core/util"
], function (Backbone, Model, Config, EventBus, Util) {

    var list = Backbone.Collection.extend({
        url: Util.getPath(Config.tree.customConfig),
        model: Model,

        /**
         * Registriert die Events "getCustomNodes" und "fetchTreeConfig".
         * Ruft initial die Funktion "fetchTreeConfig" auf.
         */
        initialize: function () {
            EventBus.on("getCustomFolderNames", this.sendCustomFolderNames, this);
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
         * Feuert das Event "sendCustomFolderNames" ab.
         * Übergibt aus allen Models die Werte aus dem Attribute "node" als Array.
         */
         sendCustomFolderNames: function () {
            EventBus.trigger("sendCustomFolderNames", this.pluck("node"));
        }
    });

    return list;
});
