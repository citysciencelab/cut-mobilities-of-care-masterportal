define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList_new',
    'views/TreeNodeChildView',
    'models/TreeChildNode',
    'views/TreeNodeLayerView',
    'eventbus'
    ], function (_, Backbone, EventBus, Config, LayerList, TreeNodeChildView, TreeChildNode, TreeLayerView, EventBus) {

        var TreeNode = Backbone.Model.extend({
            "defaults": {
                isExpanded: false
            },
            "initialize": function () {
                this.setLayerList();
                this.setChildren();
                this.getSortedLayerList();
                this.setViews();
                
                
                // this.getChildNodes();
                // this.getLayerListByTreeNode();
                // this.set("viewList", _.union(this.get("layerViews"), this.get("childViews")));
            },
            /**
             * Alle Layer die zu dieser Node gehören.
             * Config.tree.layerAttribute = Das Layer-Model-Attribut in dem die jeweilige Kategorie gesetzt ist.
             */
            "setLayerList": function () {
                var layerList = LayerList.getLayerByProperty(Config.tree.layerAttribute, this.get("name"));
                this.set("layerList", layerList);
            },
            /**
             *
             */
            "setChildren": function () {
                // zählt wie oft die jeweiligen Metadaten-Id's in der LayerList vorkommen.
                var countIDs = _.countBy(_.pluck(this.get("layerList"), "attributes"), "metaID");
                var nodeChildren = [];
                var layerChildren = [];
                _.each(countIDs, function (value, key, list) {
                    // öfter als 1
                    if (value > 1) {
                        var layerListByChildNode = _.filter(this.get("layerList"), function (layer) {
                            return layer.attributes.metaID === key;
                        }, this);
                        nodeChildren.push({"type": "node", "id": key, "name": layerListByChildNode[0].get("metaName"), "children": _.sortBy(layerListByChildNode, function (child) {
                                return child.get("name");
                            }).reverse()
                        });
                    }
                    else {
                        var layerByNode = _.filter(this.get("layerList"), function (layer) {
                            return layer.attributes.metaID === key;
                        }, this);
                        layerChildren.push({"type": "layer", "id": key, "name": layerByNode[0].get("name"), "layer": layerByNode[0]});
                    }
                }, this);
                this.set("children", _.union(_.sortBy(layerChildren, "name").reverse(), _.sortBy(nodeChildren, "name").reverse()));
            },
            /**
             * sortierte Liste für die Map. Damit die Layer in der Karte die gleiche Reihenfolge wie im baum haben
             * @return {[type]} [description]
             */
            "getSortedLayerList": function () {
                var sortedList = [];
                _.each(this.get("children"), function (child) {
                    if (child.type === "layer") {
                        sortedList.push(child.layer);
                    }
                    else if (child.type === "node") {
                        _.each(child.children, function (chi) {
                            sortedList.push(chi);
                        });
                    }
                });
                this.set("sortedLayerList", sortedList);
            },
            "setViews": function () {
                var childViews = [];
                _.each(this.get("children"), function (child) {
                    if (child.type === "layer") {
                        // console.log(child.layer);
                        child.layer.set("parentNode", this.model);
                        child.layer.set("type", "layer");
                        child.layer.set("layerType", "layerByNode");
                        var treeLayerView = new TreeLayerView({model: child.layer});
                        childViews.push(treeLayerView);
                    }
                    else if (child.type === "node") {
                        var treeNodeChildView = new TreeNodeChildView({model: new TreeChildNode(child)});
                        childViews.push(treeNodeChildView);
                    }
                }, this);
                this.set("childViews", childViews);
            },
            "toggleExpand": function () {
                if (this.get('isExpanded') === true) {
                    this.set({'isExpanded': false});
                }
                else {
                    this.set({'isExpanded': true});
                }
            },
            "moveUpInList": function () {
                this.collection.moveNodeUp(this);
            },
            "moveDownInList": function () {
                this.collection.moveNodeDown(this);
            },
            "moveChildInList": function (childName, move) {
                this.set("step", move);
                // View die bewegt werden soll
                var childView = _.find(this.get("viewList"), function (view) {
                    return view.model.get("name") === childName;
                });
                this.set("childView", childView);
                // Index der View die bewegt werden soll
                this.set("indexOfChildView", _.indexOf(this.get("viewList"), childView));
                // var indexOfChildView = _.indexOf(this.get("viewList"), childView);

                // var indexOfPrevView = indexOfChildView - 1;
                // var indexOfNextView = indexOfChildView + 1;
                // console.log(this.get("viewList")[indexOfPrevView].model.get("type"));

                // Kopie der Viewliste ohne die View die bewegt werden soll
                var copyViewList = _.without(this.get("viewList"), childView);
                // Iteriert über "Kopie-Viewliste" und fügt die "View die bewegt werden soll" ein höher oder tiefer als vorher wieder ein
                if (this.get("indexOfChildView") + move >= 0 && this.get("indexOfChildView") + move < copyViewList.length) {
                    var newViewList = [];
                    _.each(copyViewList, function (view, index) {
                        if (index === _.indexOf(this.get("viewList"), childView) + move) {
                            newViewList.push(childView);
                        }
                        newViewList.push(view);
                    }, this);
                    this.set("viewList", newViewList);
                }
                else if (this.get("indexOfChildView") + move === copyViewList.length){
                    copyViewList.push(childView);
                    this.set("viewList", copyViewList);
                }
            }
        });

        return TreeNode;
    });
