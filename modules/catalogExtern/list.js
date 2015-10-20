define([
    "backbone",
    "modules/catalogExtern/node",
    "config",
    "eventbus",
    "modules/searchbar/model" // nicht schön --> Konzept von layercatalog überarbeiten SD 02.09
    ], function (Backbone, Node, Config, EventBus) {

    var TreeList = Backbone.Collection.extend({

        model: Node,

        // Die Collection wird nach dem Modelattribut "name" sortiert.
        comparator: "name",

        initialize: function () {
            // Listener auf den EventBus.
            this.listenTo(EventBus, {
                // Empfängt die Ordner namen der ersten Ebene vom AddWMS Model
               "catalogExtern:sendExternalNodeNames": this.createNodes

            });

            // Initial werden die Namen für die 1.Ordnerebene geholt.
            EventBus.trigger("getCustomFolderNames");
        },

        // Erstellt die Ordner der 1.Ebene der entsprechenden Kategorie.
        // Die Ordnernamen (folders) kommen von layer/list.
        createNodes: function (folderNames) {
            var nodes = [];

            _.each(folderNames, function (folderName) {
                nodes.push({name: folderName, category: "externalLayers"});
            }, this);
            // Alte Models werden entfernt, neue hinzugefügt.
            // http://backbonejs.org/#Collection-reset
            this.reset(nodes);
        }
    });

    return new TreeList();
});
