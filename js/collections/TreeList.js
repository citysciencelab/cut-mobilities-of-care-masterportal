define([
    "underscore",
    "backbone",
    "models/TreeNode",
    "config",
    "eventbus"
    ], function (_, Backbone, TreeNode, Config, EventBus) {

        var TreeList = Backbone.Collection.extend({
            "url": locations.baseUrl + "../category.json",
            "model": TreeNode,
            "initialize": function () {
                EventBus.on("showLayerInTree", this.showLayerInTree, this);
                EventBus.on("fetchTreeList", this.fetchCategories, this);
                this.fetchCategories();

                // leere Ordner entfernen
                var modelsToRemove = this.filter(function (model) {
                    return model.get("layerList").length === 0;
                });
                this.remove(modelsToRemove);
            },
            "parse": function (response, options) {
                if(_.has(Config, "tree") && Config.tree.active === true) {
                    switch (options.data) {
                        case "opendata":
                            _.each(response.opendata, function (element) {
                                element.layerAttribute = "kategorieOpendata";
                            });
                            return response.opendata;
                        case "inspire":
                            _.each(response.inspire, function (element) {
                                element.layerAttribute = "kategorieInspire";
                            });
                            return response.inspire;
                        default:
                            _.each(response.opendata, function (element) {
                                element.layerAttribute = "kategorieOpendata";
                            });
                            return response.opendata;
                    }
                }
            },

            "fetchCategories": function (value) {
                this.fetch({
                    data: value,
                    cache: false,
                    async: false,
                    error: function () {
                        alert("Fehler beim Parsen");
                    }
                });
            },

            // /**
            //  * Die Node(Model) wird im Layerbaum eine Ebene nach oben verschoben.
            //  */
            // "moveNodeUp": function (model) {
            //     // Der aktuelle Index des Models innerhalb der Collection
            //     var fromIndex = this.indexOf(model);
            //     // Der neue Index für dieses Model
            //     var toIndex = fromIndex - 1;
            //     // Wenn die Node noch nicht ganz oben ist = An Position 0 in der Collection
            //     if (fromIndex > 0) {
            //         // Die Anzahl der Layer dieser Node und der oberhalb liegenden Node in sortierter Reihenfolge
            //         var countLayer = this.at(fromIndex).get("sortedLayerList").length + this.at(toIndex).get("sortedLayerList").length - 1;
            //         // bewegt die Layer auf der Karte nach oben --> Map.js
            //         _.each(this.at(fromIndex).get("sortedLayerList"), function (element) {
            //             EventBus.trigger("moveLayer", [countLayer, element.get("layer")]);
            //         });
            //         // Entfernt das Model aus der Collection
            //         this.remove(model);
            //         // Fügt das Model an neuer Position der Collection wieder hinzu
            //         this.add(model, {at: toIndex});
            //     }
            // },
            //
            // /**
            //  * Die Node(Model) wird im Layerbaum eine Ebene nach unten verschoben.
            //  */
            // "moveNodeDown": function (model) {
            //     // Der aktuelle Index des Models innerhalb der Collection
            //     var fromIndex = this.indexOf(model);
            //     // Der neue Index für dieses Model
            //     var toIndex = fromIndex + 1;
            //     // Wenn die Node noch nicht ganz unten ist = An letzter Position in der Collection
            //     if (fromIndex < this.models.length - 1) {
            //         // Die Anzahl der layer der unterhalb liegenden Node in sortierter Reihenfolge
            //         var countLayer = this.at(toIndex).get("sortedLayerList").length;
            //         // bewegt die Layer auf der Karte nach unten --> Map.js
            //         _.each(this.at(fromIndex).get("sortedLayerList"), function (element) {
            //             EventBus.trigger("moveLayer", [-countLayer, element.get("layer")]);
            //         });
            //         // Entfernt das Model aus der Collection
            //         this.remove(model);
            //         // Fügt das Model an neuer Position der Collection wieder hinzu
            //         this.add(model, {at: toIndex});
            //     }
            // },

            "showLayerInTree": function (model) {
                // öffnet den Tree
                $(".nav li:first-child").addClass("open");
                this.forEach(function (element) {
                    if (model.get("kategorieOpendata") === element.get("kategorie") || model.get("kategorieInspire") === element.get("kategorie")) {
                        element.set("isExpanded", true);
                            _.each(element.get("childViews"), function (view) {
                                if (view.model.get("name") === model.get("metaName")) {
                                    view.model.set("isExpanded", true);
                                    var modelID = _.where(view.model.get("children"), {cid: model.cid});
                                    var viewChildLayer = _.find(view.model.get("childViews"), function (view) {
                                        return view.model.cid === modelID[0].cid;
                                    });
                                    $("#tree").scrollTop(viewChildLayer.$el[0].offsetTop - 100);
                                }
                                else if (view.model.get("name") === model.get("name")){
                                    $("#tree").scrollTop(view.$el[0].offsetTop - 100);
                                }
                            });
                        model.set("selected", true);
                    }
                    else {
                        element.set("isExpanded", false);
                    }
                });
            }
        });

        return new TreeList();
    });
