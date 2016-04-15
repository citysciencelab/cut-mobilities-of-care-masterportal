define([
    "backbone",
    "config",
    "eventbus"
], function (Backbone, Config, EventBus) {

    var treeNodes = [];

    var list = Backbone.Collection.extend({
        // url: Util.getPath(Config.tree.customConfig),
        url: "tree-config.json",

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
         * Holt sich die gewünschte Tree-Konfiguration (Config.tree.customConfig).
         * Überschreibt die Config.tree.layer mit den Layern der Tree-Konfiguration.
         */
        fetchTreeConfig: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    EventBus.trigger("alert", {
                        text: "Fehler beim Laden von: " + Config.tree.customConfig,
                        kategorie: "alert-warning"
                    });
                },
                success: function (collection) {
                    // Wenn ein Portal mit einem "custom-tree" parametrisiert aufgerufen wird,
                    // ist Config.tree.layer bereits definiert.
                    // Beispiel: http://localhost:9001/portale/architekten/?layerIDs=1043,1757&visibility=true,true&center=567323.9473630342,5935541.810008875&zoomlevel=2
                    // Dann wird hier die tree-config.json mit Config.tree.layer zusammengeführt.
                    if (_.has(Config.tree, "layer") === true) {
                        collection.each(function (model) {
                            var layer = _.findWhere(Config.tree.layer, {id: model.get("id")});

                            if (!_.isUndefined(layer)) {
                                model.set(layer);
                            }
                        });
                    }
                    Config.tree.layer = collection.toJSON();
                }
            });
        },
        parse: function (response) {
            // key = Hintergrundkarten || Fachdaten || Ordner
            // value = Array von Objekten (Layer || Ordner)
            _.each(response, function (value, key) {
                _.each(value, function (element) {
                    if (_.has(element, "Layer")) {
                        _.each(element.Layer, function (layer) {
                            if (_.isUndefined(element.node)) {
                                treeNodes.push(_.extend({node: element.Titel, isbaselayer: (key === "Hintergrundkarten") ? true : false}, layer));
                            }
                            else {
                                treeNodes.push(_.extend({node: element.node, subfolder: element.Titel, isbaselayer: (key === "Hintergrundkarten") ? true : false}, layer));
                            }
                        });
                    }
                    if (_.has(element, "Ordner")) {
                        _.each(element.Ordner, function (folder) {
                            folder.node = element.Titel;
                            // rekursiver Aufruf
                            this.parse({Ordner: [folder]});
                        }, this);
                    }
                }, this);
            }, this);

            return treeNodes;
        },

        /**
         * Feuert das Event "sendCustomFolderNames" ab.
         * Übergibt aus allen Models die Werte aus dem Attribute "node" als Array.
         */
         sendCustomFolderNames: function () {
            EventBus.trigger("sendCustomFolderNames", _.uniq(_.without(this.pluck("node"), undefined)));
        }
    });

    return list;
});
