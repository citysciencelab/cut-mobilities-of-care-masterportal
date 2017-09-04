define(function (require) {

    var QueryModel = require("modules/tools/filter/query/model"),
        WfsQueryModel;

    WfsQueryModel = QueryModel.extend({
        initialize: function () {
            var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")});

            // parent (QueryModel) initialize
            this.superInitialize();
            if (!_.isUndefined(layerObject)) {
                this.requestMetadata(layerObject.get("url"), layerObject.get("featureType"), layerObject.get("version"));
            }
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
                    if (featureAttribute.type === "boolean") {
                        if (feature.get(featureAttribute.name) === "true") {
                            values.push("Ja");
                            feature.set(featureAttribute.name, "Ja");
                        }
                        else {
                            values.push("Nein");
                            feature.set(featureAttribute.name, "Nein");
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
            var features = this.runPredefinedRules(),
                attributes = [],
                featureIds = [];

            this.get("snippetCollection").forEach(function (snippet) {
                if (snippet.hasSelectedValues() === true) {
                    attributes.push(snippet.getSelectedValues());
                }
            });

            if (attributes.length > 0) {
                _.each(features, function (feature) {
                    var booltest = this.isFilterMatch(feature, attributes);

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

        isValueMatch: function (feature, attribute) {
            var isMatch = false;

            isMatch = _.find(attribute.values, function (value) {
                    if (_.isUndefined(feature.get(attribute.attrName)) === false) {
                        return feature.get(attribute.attrName).indexOf(value) !== -1;
                    }
                });
            return !_.isUndefined(isMatch);
        },

        /**
         * checks if a value is within a range of values
         * @param  {ol.feature} feature
         * @param  {object} attribute
         * @return {boolean}
         */
        isIntegerInRange: function (feature, attribute) {
            var isMatch = false,
                valueList = _.extend([], attribute.values);

            if (_.isUndefined(feature.get(attribute.attrName)) === false) {
                var featureValue = parseInt(feature.get(attribute.attrName), 10);

                valueList.push(featureValue);
                valueList = _.sortBy(valueList);
                isMatch = valueList[1] === featureValue;
            }
            return isMatch;
        },

        isFilterMatch: function (feature, filterAttr) {
            var isMatch = false;

            isMatch = _.every(filterAttr, function (attribute) {
                if (attribute.type === "integer") {
                    return this.isIntegerInRange(feature, attribute);
                }
                else {
                    return this.isValueMatch(feature, attribute);
                }
            }, this);
            return isMatch;
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
