define([
    "backbone",
    "modules/layer/list",
    "eventbus"
], function (Backbone, LayerList, EventBus) {

    var List = Backbone.Collection.extend({

        initialize: function () {
            EventBus.on("sendBaseLayer", this.addBaseLayer, this);
            EventBus.trigger("getBaseLayer");
        },

        addBaseLayer: function (baselayer) {
            _.each(baselayer, function (layer) {
                this.add(layer);
            }, this);
        }
    });

    return new List();
});
