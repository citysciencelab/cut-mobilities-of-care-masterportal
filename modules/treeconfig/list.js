define([
    "backbone",
    "modules/treeconfig/model",
    "config",
    "eventbus",
    "modules/core/util"
], function (Backbone, Model, Config, EventBus, Util) {

    var treeNodes = [];

    var list = Backbone.Collection.extend({
        // url: Util.getPath(Config.tree.customConfig),
        url: "tree-config.json",
        // model: Model,

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
                    var layerList = _.flatten(collection.pluck("layers"));

                    // Wenn ein Portal mit einem "custom-tree" parametrisiert aufgerufen wird,
                    // ist Config.tree.layer bereits definiert.
                    // Beispiel: http://localhost:9001/portale/architekten/?layerIDs=1043,1757&visibility=true,true&center=567323.9473630342,5935541.810008875&zoomlevel=2
                    // Dann wird hier die tree-config.json mit Config.tree.layer zusammengeführt.
                    if (_.has(Config.tree, "layer") === true) {
                        layerList.map(function (la) {
                            var layer = _.findWhere(Config.tree.layer, {id: la.id});

                            return _.extend(la, layer);
                        });
                    }
                    console.log(collection.toJSON());
                    Config.tree.layer = collection.toJSON();
                }
            });
        },
        parse: function (response) {
            // key = Hintergrundkarten || Fachdaten || Ordner
            // value = Array von Objekten (Layer || Ordner)
            _.each(response, function (value, key) {
                var isbaselayer = "";

                if (key === "Hintergrundkarten") {
                    isbaselayer = true;
                }
                else {
                    isbaselayer = false;
                }

                _.each(value, function (element) {
                                                // console.log(element);
                    if (_.has(element, "Layer")) {
                        _.each(element.Layer, function (layer) {
                            if (_.isUndefined(element.node)) {
                                treeNodes.push({
                                    // type: "layers",
                                    visibility: layer.visibility,
                                    node: element.Titel,
                                    id: layer.id,
                                    isbaselayer: isbaselayer
                                });
                            }
                            else {
                                treeNodes.push({
                                    // type: "layers",
                                    visibility: layer.visibility,
                                    subfolder: element.Titel,
                                    id: layer.id,
                                    node: element.node,
                                    isbaselayer: isbaselayer
                                });
                            }

                        });
                    }
                    if (_.has(element, "Ordner")) {
                        // console.log(element);
                        _.each(element.Ordner, function (folder) {
                            console.log(folder);
                            folder.node = element.Titel;
                            // console.log(folder);
                            // // folder.id = _.uniqueId(folder.Titel);
                            // treeNodes.push({
                            //     type: "layers",
                            //     node: element.Titel,
                            //     subfolder: folder.Titel,
                            //     id: folder.id
                            // });
                            // rekursiver Aufruf
                            this.parse({Ordner: [folder]});
                        }, this);
                    }
                }, this);
            }, this);
// console.log(treeNodes);
            return treeNodes;
        },
        /**
         * Feuert das Event "sendCustomFolderNames" ab.
         * Übergibt aus allen Models die Werte aus dem Attribute "node" als Array.
         */
         sendCustomFolderNames: function () {
            EventBus.trigger("sendCustomFolderNames", _.without(this.pluck("node"), undefined));
        }
    });

    return list;
});
