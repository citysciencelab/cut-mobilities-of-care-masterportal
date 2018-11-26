import Tool from "../core/modelList/tool/model";

const WfsFeatureFilter = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        wfsList: [],
        renderToWindow: true,
        glyphicon: "glyphicon-filter"
    }),
    initialize: function () {
        this.superInitialize();
    },
    getLayers: function () {
        var layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
            featureLayers = layers.filter(function (layer) {
                return layer.get("layer").getSource().getFeatures().length > 0;
            }),
            filterLayers = featureLayers.filter(function (layer) {
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

export default WfsFeatureFilter;
