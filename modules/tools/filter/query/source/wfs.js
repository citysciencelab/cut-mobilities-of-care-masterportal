define(function (require) {

    var QueryModel = require("modules/tools/filter/query/model"),
        WfsQueryModel;

    WfsQueryModel = QueryModel.extend({
        initialize: function () {
            var model = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")});

            this.describeFeatureTypRequest(model.get("url"), model.get("featureType"), model.get("version"));
        },

        describeFeatureTypRequest: function (url, featureType, version) {
            $.ajax({
                url: url,
                context: this,
                data: "service=WFS&version=" + version + "&request=DescribeFeatureType&typename" + featureType,
                success: this.createTypeMap
            });
        },

        parseResponse: function (resp) {
            var elements = $("element", resp),
                typeMap = [];

            _.each(elements, function (element) {
                typeMap.push({name: $(element).attr("name"), type: $(element).attr("type")});
            });

            return typeMap;
        },

        setValues: function (typeMap) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
                features = model.getLayerSource().getFeatures(),
                values = [];

            _.each(typeMap, function (elem) {
                values = [];
                _.each(features, function (feature) {
                    values.push(feature.get(elem.name));
                });
                elem.values = _.unique(values);
            }, this);

            return typeMap;
        }
    });

    return WfsQueryModel;
});
