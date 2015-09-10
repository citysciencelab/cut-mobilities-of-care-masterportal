define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {

    var List = Backbone.Collection.extend({

        initialize: function () {
            this.listenToOnce(EventBus, {
                "layerlist:sendBaselayerList": this.addBaseLayer
            });
            this.listenTo(EventBus, {
                "layerlist:updateBaselayerSelection": this.updateBaseLayerSelection
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
        },

        updateBaseLayerSelection: function () {
            var layerlist = this.where({"selected": true});

            _.each(layerlist, function (layer) {
                EventBus.trigger("addModelToSelectionList", layer);
            });
        }
    });

    return new List();
});
