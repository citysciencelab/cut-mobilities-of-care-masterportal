define(function () {
    var WfsFeatureFilter = Backbone.Model.extend({
        defaults: {
            wfsList: []
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.checkStatus
            });
        },
        checkStatus: function (args) { // Fenstermanagement
            if (args[2].get("id") === "wfsFeatureFilter") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        getLayers: function () {
            var layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
                featureLayers = _.filter(layers, function (layer) {
                    return layer.get("layer").getSource().getFeatures().length > 0;
                }),
                filterLayers = _.filter(featureLayers, function (layer) {
                    return layer.get("filterOptions") && layer.get("filterOptions").length > 0;
                }),
                wfsList = [];

            _.each(filterLayers, function (layer) {
                wfsList.push({
                    id: layer.id,
                    name: layer.get("name"),
                    filterOptions: layer.get("filterOptions"),
                    layer: layer.get("layer"),
                    styleField: layer.get("styleField")
                });
            });
            this.set("wfsList", wfsList);
        }
    });

    return WfsFeatureFilter;
});
