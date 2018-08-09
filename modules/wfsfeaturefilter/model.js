define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
        WfsFeatureFilter;

    WfsFeatureFilter = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            wfsList: [],
            renderToWindow: true
        }),
        initialize: function () {
            this.superInitialize();
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
