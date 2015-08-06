define([
    "backbone",
    "modules/layercatalog/node",
    "config",
    "eventbus"
    ], function (Backbone, Node, Config, EventBus) {

    var TreeList = Backbone.Collection.extend({
        initialize: function () {
            EventBus.on("showLayerInTree", this.showLayerInTree, this);
            EventBus.on("sendOpendataFolder sendInspireFolder sendCustomNodes", this.createNodes, this);
            if (Config.tree.orderBy === "opendata") {
                EventBus.trigger("getOpendataFolder");
            }
            else if (Config.tree.orderBy === "inspire") {
                EventBus.trigger("getInspireFolder");
            }
            else {
                EventBus.trigger("getCustomNodes");
            }
        },
        createNodes: function (folders) {
            this.reset(null);
            _.each(folders.sort(), function (folder) {
                this.add(new Node({folder: folder, thema: Config.tree.orderBy}));
            }, this);
        },
        showLayerInTree: function (model) {
            // öffnet den Tree
            $(".nav li:first-child").addClass("open");
            this.forEach(function (element) {
                if (model.get("type") !== undefined && model.get("type") === "nodeChild") {
                    if (model.get("children")[0].get("kategorieOpendata") === element.get("folder") || model.get("children")[0].get("kategorieInspire") === element.get("folder") || model.get("children")[0].get("kategorieCustom") === element.get("folder")) {
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
                    if (model.get("kategorieOpendata") === element.get("folder") || model.get("kategorieInspire") === element.get("folder") || model.get("kategorieCustom") === element.get("folder")) {
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
