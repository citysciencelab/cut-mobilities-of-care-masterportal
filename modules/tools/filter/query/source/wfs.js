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
                    if (featureAttribute.type === "boolean") {
                        if (feature.get(featureAttribute.name) === "true") {
                            values.push("Ja");
                        }
                        else {
                            values.push("Nein");
                        }
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
         * Collect the feature Ids that match the predefined rules
         * and trigger them to the ModelList
         */
        runPredefinedRules: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
                features = model.getLayerSource().getFeatures(),
                featureIds = [];

            _.each(features, function (feature) {
                _.each(this.get("predefinedRules"), function (rule) {
                    if (_.contains(rule.values, feature.get(rule.attrName))) {
                        featureIds.push(feature.getId());
                    }
                });
            }, this);
            Radio.trigger("ModelList", "showFeaturesById", this.get("layerId"), featureIds);
        },

        runFilter: function () {
            console.log("runFilter");
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
                features = model.getLayerSource().getFeatures(),
                selectedValues = [],
                featureIds = [];

                this.get("snippetCollection").forEach(function (snippet) {
                    selectedValues.push(snippet.get("valuesCollection").where({isSelected: true}));
                });

            if (selectedValues.length > 0) {
                _.each(_.flatten(selectedValues), function (valueModel, index) {
                    if (featureIds[valueModel.get("attr")] === undefined) {
                        featureIds[valueModel.get("attr")] = [];
                    }
                    _.each(features, function (feature) {
                        if (valueModel.get("value") === feature.get(valueModel.get("attr"))) {
                            featureIds[valueModel.get("attr")].push(feature.getId());
                        }
                    });
                    console.log(featureIds[valueModel.get("attr")]);
                }, this);
            }
            Radio.trigger("ModelList", "showFeaturesById", this.get("layerId"), _.intersection(featureIds["bezirk"], featureIds["stadtteil"]));
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
