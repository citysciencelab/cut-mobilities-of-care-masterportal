define([
    "backbone",
    "modules/layer/list"
], function (Backbone, LayerList) {

    var List = Backbone.Collection.extend({
        initialize: function () {
            this.add(LayerList.where({isbaselayer: true}));
        }
    });

    return new List();
});
