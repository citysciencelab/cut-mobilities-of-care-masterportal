define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList_new',
    'eventbus'
    ], function (_, Backbone, EventBus, Config, LayerList, EventBus) {

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
                    childNodes.push({name: layerModel.metaName, id: element, parentName: this.get("name")});
                }, this);
                this.set("childNodes", _.sortBy(childNodes, function (obj) {
                        return obj.name;
                    })
                );
            },
            "getLayerListByTreeNode": function () {
                // Alle Layer die nicht zu einem Unterordner gehören, sprich der Metadaten-ID ist nur einmal vorhanden
                var layerModel = _.reject(this.get("layerList"), function (model) {
                    return _.contains(this.get("idsForChildNodes"), model.get("metaID"));
                }, this);
                this.set("layerListByTreeNode", layerModel);
            },
            "setExpand": function (value) {
                this.set("isExpanded", value);
            },
            "moveUpInList": function () {
                this.collection.moveNodeUp(this);
            },
            "moveDownInList": function () {
                this.collection.moveNodeDown(this);
            }
        });

        return TreeNode;
    });
