define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {

    var List = Backbone.Collection.extend({

        initialize: function () {
            this.listenToOnce(EventBus, {
                "layerlist:sendBaselayerList": this.addBaseLayer
            });
            EventBus.trigger("layerlist:getBaselayerList");
        },

        addBaseLayer: function (baselayer) {
            baselayer = _.sortBy(baselayer, function (layer) {
                return layer.get("name");
            });

            _.each(baselayer, function (layer) {
                this.add(layer);
            }, this);
        }
    });

    return new List();
});
