define(function (require) {

    var QueryModel = require("modules/tools/filter/query/model"),
        WfsQueryModel;

    WfsQueryModel = QueryModel.extend({
        initialize: function () {
            var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")});

            // parent (QueryModel) initialize
            this.superInitialize();
            this.requestMetadata(layerObject.get("url"), layerObject.get("featureType"), layerObject.get("version"));
        },

        /**
         * Führt DescriptFeatureType Request aus
         * @param  {string} url - WFS Url
         * @param  {string} featureType - WFS FeatureType
         * @param  {string} version - WFS Version
         */
        requestMetadata: function (url, featureType, version) {
            $.ajax({
                url: url,
                context: this,
                data: "service=WFS&version=" + version + "&request=DescribeFeatureType&typename=" + featureType,
                // parent (QueryModel) function
                success: this.createSnippets
            });
        },

        /**
         * Extract Attribute names and types from DescribeFeatureType-Response
         * @param  {XML} response
         * @return {object} - Mapobject containing names and types
         */
        parseResponse: function (response) {
            var elements = $("element", response),
                featureAttributesMap = [];

            _.each(elements, function (element) {
                featureAttributesMap.push({name: $(element).attr("name"), type: $(element).attr("type")});
            });

            return featureAttributesMap;
        },

        /**
         * [description]
         * @param  {[type]} typeMap [description]
         * @return {[type]}         [description]
         */
        collectAttributeValues: function (featureAttributesMap) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
                features = model.getLayerSource().getFeatures(),
                values = [];

            _.each(featureAttributesMap, function (featureAttribute) {
                values = [];
                _.each(features, function (feature) {
                    if (featureAttribute.type === "integer") {
                        values.push(parseInt(feature.get(featureAttribute.name), 10));
                    }
                    else {
                        var stringValues = this.parseStringType(feature, featureAttribute);

                        values = _.union(values, stringValues);
                    }
                }, this);
                featureAttribute.values = _.unique(values);
            }, this);

            return featureAttributesMap;
        },
        /**
         * parsed attributwerte mit einem Pipe-Zeichen ("|") und returned ein Array mit den einzelnen Werten
         * @param  {[type]} feature          [description]
         * @param  {[type]} featureAttribute [description]
         * @return {[type]}                  [description]
         */
        parseStringType: function (feature, featureAttribute) {
            var values = [];

            if (!_.isUndefined(feature.get(featureAttribute.name))) {
                if (feature.get(featureAttribute.name).indexOf("|") !== -1) {
                    var featureValues = feature.get(featureAttribute.name).split("|");

                    _.each(featureValues, function (value) {
                        values.push(value);
                    });
                }
                else {
                    values.push(feature.get(featureAttribute.name));
                }
            }
            return values;
        }
    });

    return WfsQueryModel;
});
