define([
    "backbone",
    "eventbus",
    "config"
], function (Backbone, EventBus, Config) {

    var WFSListModel = Backbone.Model.extend({
        defaults: {
            layerlist: [], // Array aus {id, name}
            layerid: ""
        },
        initialize: function () {
            EventBus.on("layerlist:sendVisibleWFSlayerList", this.fillLayerList, this); // wird automatisch getriggert, wenn sich visibility ändert

            this.listenTo(this, {"change:layerid": this.createList});
        },
        createList: function () {
            var layers = this.get("layerlist"),
                layer = _.find(layers, {id: this.get("layerid")}),
                features = layer.features;

            _.each(features, function (feature) {
                console.log(feature.getProperties());
            });
        },
        fillLayerList: function (layers) {
            var ll = [];

//            _.each(layers, function (layer) {
//                console.log(layer);
//                ll.push({
//                    id: layer.id,
//                    name: layer.get("name"),
//                    features: layer.get("source").getFeatures()
//                });
//            });
//            this.set("layerlist", ll);
        }
    });

    return new WFSListModel();
});
