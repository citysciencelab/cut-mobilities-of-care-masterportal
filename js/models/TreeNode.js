define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList'
    ], function (_, Backbone, EventBus, Config, LayerList) {

        var TreeNode = Backbone.Model.extend({
            "defaults": {
                isExpanded: false
            },
            "initialize": function () {
                // console.log("initialize TreeNode");
                this.set("id", this.cid);
                this.setOrderTreeBy();
                this.setLayerList();
                console.log(this);
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
