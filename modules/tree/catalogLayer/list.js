define([
    "backbone",
    "modules/tree/catalogLayer/node",
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
                "showLayerInTree": this.showLayerInTree,
                "sendNodeNames sendCustomFolderNames": this.createNodes
                // "catalogList:render": this.createNodes
            });

            // Initial werden die Namen für die 1.Ordnerebene geholt.
            if (Config.tree.type === "custom") {
                EventBus.trigger("getCustomFolderNames");
            }
            else {
                EventBus.trigger("getNodeNames");
            }
        },

        // Erstellt die Ordner der 1.Ebene der entsprechenden Kategorie.
        // Die Ordnernamen (folders) kommen von layer/list.
        createNodes: function (folderNames) {
            var nodes = [];

            _.each(folderNames, function (folderName, index) {
                nodes.push({name: folderName, nodeIndex: index});
            }, this);
            // Wenn es ein CustomTree ist, wird die Reihenfolge aus der Tree.json übernommen.
            if (Config.tree.type === "custom") {
                this.comparator = "nodeIndex";
            }
            // Alte Models werden entfernt, neue hinzugefügt.
            // http://backbonejs.org/#Collection-reset
            this.reset(nodes);
        },

        //
        showLayerInTree: function (model) {
            // öffnet den Tree
            $(".nav li:first-child").addClass("open");
            // öffnet die Geofachdaten
            $(".layer-catalog-list").show();
            $(".layer-catalog > .header > .glyphicon:not(.glyphicon-adjust)").addClass("glyphicon-minus-sign");
            $(".layer-catalog > .header > .glyphicon:not(.glyphicon-adjust)").removeClass("glyphicon-plus-sign");
            // schließ die Hintergrundkarten
            $(".base-layer-list").hide();
            $(".base-layer-catalog > .header > .glyphicon:not(.glyphicon-adjust)").removeClass("glyphicon-minus-sign");
            $(".base-layer-catalog > .header > .glyphicon:not(.glyphicon-adjust)").addClass("glyphicon-plus-sign");

            this.forEach(function (element) {
                if (model.get("type") !== undefined && model.get("type") === "nodeChild") {
                    if (model.get("children")[0].get("node") === element.get("name")) {
                        element.set("isExpanded", true);
                        model.set("isExpanded", true);
                        _.each(model.get("children"), function (child) {
                            child.set("selected", true);
                        });
                        model.set("isSelected", true);
                        $(".layer-catalog-list").scrollTop(model.get("childViews")[0].$el[0].offsetTop - 350);
                    }
                }
                else {
                    if (model.get("node") === element.get("name")) {
                        element.set("isExpanded", true);
                        _.each(element.get("childViews"), function (view) {
                            if (view.model.get("name") === model.get("metaName") || view.model.get("name") === model.get("subfolder")) {
                                view.model.set("isExpanded", true);
                                if (model.get("type") === "nodeLayer") {
                                    $(".layer-catalog-list").scrollTop(view.$el[0].offsetTop - 350);
                                }
                                else {
                                    var modelID = _.where(view.model.get("children"), {cid: model.cid}),
                                        viewChildLayer = _.find(view.model.get("childViews"), function (view) {
                                            return view.model.cid === modelID[0].cid;
                                        });

                                    $(".layer-catalog-list").scrollTop(viewChildLayer.$el[0].offsetTop - 350);
                                }
                            }
                            else if (view.model.get("name") === model.get("name")) {
                                $(".layer-catalog-list").scrollTop(view.$el[0].offsetTop - 350);
                            }
                        });
                        model.set("selected", true);
                    }
                    else {
                            element.set("isExpanded", false);
                    }
                }

            });
        }
    });

    return new TreeList();
});
