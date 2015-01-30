define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList_new',
    'eventbus'
    ], function (_, Backbone, EventBus, Config, LayerList, EventBus) {

        var TreeChildNode = Backbone.Model.extend({
            "defaults": {
                isExpanded: false
            },
            "initialize": function () {
                // console.log(this.get("id"));
                // console.log(this.get("parentName"));
                this.set("layerList", LayerList.where({metaID: this.get("id"), kategorieOpendata: this.get("parentName")}));
            },
            "setExpand": function (value) {
                this.set("isExpanded", value);
            }
        });

        return TreeChildNode;
    });
