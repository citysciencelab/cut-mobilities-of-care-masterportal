define([
    'underscore',
    'backbone',
    'models/TreeNode',
    'config',
    'eventbus'
    ], function (_, Backbone, TreeNode, Config, EventBus) {

        var TreeList = Backbone.Collection.extend({
            "url": "../../category.json",
            "model": TreeNode,
            "initialize": function () {
                EventBus.on("showLayerInTree", this.showLayerInTree, this);
                this.fetch({
                    cache: false,
                    async: false,
                    error: function () {
                        alert('Fehler beim Parsen');
                    }
                });
                // leere Ordner entfernen
                var modelsToRemove = this.filter(function (model) {
                    return model.get("layerList").length === 0;
                });
                this.remove(modelsToRemove);
            },
            "parse": function (response) {
                if(_.has(Config, "tree") && Config.tree.active === true) {
                    switch (Config.tree.orderBy) {
                        case "opendata":
                            return response.opendata;
                        }
                }
            },
            "moveNodeUp": function (model) {
                var index = this.indexOf(model);
                if (index > 0) {
                    this.remove(model, {silent: true});
                    this.add(model, {at: index - 1});
                }
                if (index > 0) {
                    _.each(model.get("layerList"), function (element) {
                        EventBus.trigger("moveLayer", [this.at(index).get("layerList").length, element.get("layer")]);
                    }, this);
                }
            },
            "moveNodeDown": function (model) {
                var index = this.indexOf(model);
                if (index < this.models.length) {
                    this.remove(model, {silent: true});
                    this.add(model, {at: index + 1});
                }
                _.each(model.get("layerList"), function (element) {
                    EventBus.trigger("moveLayer", [-this.at(index).get("layerList").length, element.get("layer")]);
                }, this);
            },
            "showLayerInTree": function (model) {
                // öffnet den Tree
                $(".nav li:first-child").addClass("open");
                this.forEach(function (element) {
                    if (model.get("kategorieOpendata") === element.get("name")) {
                        element.set("isExpanded", true);
                        if (model.get("layerType") === "layerByChildNode") {
                            _.each(element.get("childViews"), function (view) {
                                if (view.model.get("name") === model.get("metaName")) {
                                    view.model.set("isExpanded", true);
                                }
                                else {
                                    view.model.set("isExpanded", false);
                                }
                            });
                        }
                        model.set("visibility", true);
                    }
                    else {
                        element.set("isExpanded", false);
                    }
                });
                // this.models[0].set("isExpanded", true);
            }
        });

        return new TreeList();
    });
