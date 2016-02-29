define([
    "backbone",
    "backbone.radio",
    "eventbus"
], function (Backbone, Radio, EventBus) {

    var List = Backbone.Collection.extend({
        comparator: "name",
        initialize: function () {
            this.listenTo(EventBus, {
                "layerlist:sendBaselayerList": this.addBaseLayer
            });

            this.addBaseLayer();
        },

        addBaseLayer: function () {
            var baseLayer = Radio.request("LayerList", "getLayerListWhere", {isbaselayer: true});

            this.reset(baseLayer);
        }
    });

    return new List();
});
