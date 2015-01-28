define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList_new',
    'EventBus'
    ], function (_, Backbone, EventBus, Config, LayerList, EventBus) {

        var TreeNode = Backbone.Model.extend({
            "defaults": {
                isExpanded: false
            },
            "initialize": function () {
                this.set("id", this.cid);
                this.setOrderTreeBy();
                this.setLayerList();
            },
            "setOrderTreeBy": function () {
                switch (Config.tree.orderBy) {
                    case "opendata":
                        this.set("orderTreeByProperty", "kategorieOpendata");
                        break;
                    }
            },
            "setLayerList": function () {
                // console.log("setLayerList");
                var layerList = LayerList.getLayerByProperty(this.get("orderTreeByProperty"), this.get("name"));
                this.set("layerList", layerList);
                // console.log(layerList);
            },
            "setExpand": function (value) {
                // console.log("setExpand");
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
