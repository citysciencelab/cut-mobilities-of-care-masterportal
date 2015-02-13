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
                // this.set("id", this.cid);
                this.setOrderTreeBy();
                this.getLayerList();
                this.getChildNodes();
                this.getLayerListByTreeNode();
                this.set("viewList", _.union(this.get("layerViews"), this.get("childViews")));
            },
            "setOrderTreeBy": function () {
                switch (Config.tree.orderBy) {
                    case "opendata":
                        this.set("orderTreeByProperty", "kategorieOpendata");
                        break;
                    }
            },
            "getLayerList": function () {
                var layerList = LayerList.getLayerByProperty(this.get("orderTreeByProperty"), this.get("name"));
                this.set("layerList", layerList);
            },
            "getChildNodes": function () {
                // welche ID(vom Metadatensatz) kommt wie oft in der Layerlist vor
                var countIDs = _.countBy(_.pluck(this.get("layerList"), "attributes"), "metaID");
                // öfter als 1
                var moreOftenOneIDs = [];
                this.set("idsForChildNodes", moreOftenOneIDs);
                _.each(countIDs, function (value, key, list) {
                    if (value > 1) {
                        moreOftenOneIDs.push(key);
                    }
                });
                // finde zu den IDs die dazugehörigen Namen (entspricht den ChildNodes)
                var childNodes = [];
                _.each(moreOftenOneIDs, function (element, index) {
                    var layerModel = _.findWhere(_.pluck(this.get("layerList"), "attributes"), { "metaID": element});
                    childNodes.push({name: layerModel.metaName, metaID: element, parentName: this.get("name"), parentNode: this, type: "childNode"});
                }, this);
                this.set("childNodes", _.sortBy(childNodes, function (obj) {
                        return obj.name;
                    })
                );

                var childViews = [];
                _.each(this.get("childNodes"), function (childNode) {
                    var treeNodeChildView = new TreeNodeChildView({model: new TreeChildNode(childNode)});
                    childViews.push(treeNodeChildView);
                }, this);
                this.set("childViews", childViews);
            },
            "getLayerListByTreeNode": function () {
                // Alle Layer die nicht zu einem Unterordner gehören, sprich die Metadaten-ID ist nur einmal vorhanden
                var layerModel = _.reject(this.get("layerList"), function (model) {
                    model.set("type", "layerByNode");
                    return _.contains(this.get("idsForChildNodes"), model.get("metaID"));
                }, this);
                this.set("layerListByTreeNode", layerModel);

                var layerViews = [];
                _.each(this.get("layerListByTreeNode"), function (layerNode) {
                    layerNode.set("layerType", "layerByNode");
                    layerNode.set("parentNode", this.model);
                    var treeLayerView = new TreeLayerView({model: layerNode});
                    layerViews.push(treeLayerView);
                });
                this.set("layerViews", layerViews);
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
