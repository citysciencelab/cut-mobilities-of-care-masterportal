define([
    "backbone",
    "eventbus",
    "config"
], function (Backbone, EventBus, Config) {

    var WFSListModel = Backbone.Model.extend({
        defaults: {
            layerlist: [] // Array aus {id, name}
        },
        initialize: function () {
            EventBus.on("layerlist:sendVisibleWFSlayerList", this.fillLayerList, this); // wird automatisch getriggert, wenn sich visibility ändert
        },
        fillLayerList: function (layers) {
            var ll = [];

            _.each(layers, function (layer) {
                ll.push({
                    id: layer.id,
                    name: layer.get("name")
                });
            });
            this.set("layerlist", ll);
        }
    });

    return new WFSListModel();
});
