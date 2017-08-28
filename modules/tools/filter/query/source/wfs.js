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
                newFeatures = [];

            _.each(features, function (feature) {
                _.each(this.get("predefinedRules"), function (rule) {
                    if (_.contains(rule.values, feature.get(rule.attrName))) {
                        newFeatures.push(feature);
                    }
                });
            }, this);
            return newFeatures;
        },

        runFilter: function () {
            console.log("runFilter");
            var features = this.runPredefinedRules(),
                attributes = [],
                featureIds = [];

            this.get("snippetCollection").forEach(function (snippet) {
                var selectedModels = snippet.get("valuesCollection").where({isSelected: true}),
                    obj = {
                        attrName: snippet.get("name"),
                        values: []
                    };

                if (selectedModels.length > 0) {
                    _.each(selectedModels, function (model) {
                        obj.values.push({value: model.get("value")});
                    });
                    attributes.push(obj);
                }
            });

            if (attributes.length > 0) {
                _.each(features, function (feature) {
                    var booltest = this.findFeatureIds(attributes, feature);

                    if (booltest) {
                        featureIds.push(feature.getId());
                    }
                }, this);
            }
            else {
                _.each(features, function (feature) {
                    featureIds.push(feature.getId());
                }, this);
            }
            this.setFeatureIds(featureIds);
            this.trigger("featureIdsChanged");
        },

        findFeatureIds: function (attributes, feature) {
            var booltest = false;

            booltest = _.every(attributes, function (attribute) {
                return _.find(attribute.values, function (value) {
                    return feature.get(attribute.attrName).indexOf(value.value) !== -1;
                });
            });
            return booltest;
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
