define(function (require) {

    var QueryModel = require("modules/tools/filter/query/model"),
        WfsQueryModel;

    WfsQueryModel = QueryModel.extend({
        initialize: function () {
            this.superInitialize();
            this.prepareQuery();
        },
        /**
         * gathers Information for this Query including the wfs features and metadata
         * waits for WFS features to be loaded if they aren't loaded already.
         * @return {[type]} [description]
         */
        prepareQuery: function () {
            var features = this.getFeaturesFromWFS();

            if (features.length > 0) {
                this.setFeatures(features);
                this.buildQueryDatastructure();
            }
            else {
                this.listenToFeaturesLoaded();
            }
            return features;
        },
        /**
         * Waits for the Layer to load its features and proceeds requests the metadata
         * @return {[type]} [description]
         */
        listenToFeaturesLoaded: function () {
            this.listenTo(Radio.channel("WFSLayer"), {
                "featuresLoaded": function (layerId, features) {
                    if (layerId = this.get("layerId")) {
                        this.setFeatures(features);
                        this.buildQueryDatastructure();
                    }
                }
            });
        },
        /**
         * request the features for this query from the modellist
         * @return {[type]} [description]
         */
        getFeaturesFromWFS: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
                features = [];

            if (!_.isUndefined(model)) {
                features = model.getLayerSource().getFeatures();
            }
            return features;
        },
        /**
         * Waits for the Layer to load its features and proceeds requests the metadata
         * @return {[type]} [description]
         */
        listenToFeaturesLoaded: function () {
            this.listenTo(Radio.channel("WFSLayer"), {
                "featuresLoaded": function (layerId, features) {
                    if (layerId = this.get("layerId")) {
                        this.setFeatures(features);
                        this.buildQueryDatastructure();
                    }
                }
            });
        },

        /**
         * Sends a DescriptFeatureType Request for the Layer asscociated with this Query
         * and proceeds to build the datastructure including the snippets for this query
         * @param  {string} url - WFS Url
         * @param  {string} featureType - WFS FeatureType
         * @param  {string} version - WFS Version
         */
        buildQueryDatastructure: function () {
            var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")}),
                url,
                featureType,
                version;

            if (!_.isUndefined(layerObject)) {
                url = Radio.request("Util", "getProxyURL", layerObject.get("url"));
                featureType = layerObject.get("featureType");
                version = layerObject.get("version");
                this.requestMetadata(url, featureType, version, this.createSnippets);
            }
        },
        /**
         * Führt DescriptFeatureType Request aus
         * @param  {[type]} url         [description]
         * @param  {[type]} featureType [description]
         * @param  {[type]} version     [description]
         * @return {[type]}             [description]
         */
        requestMetadata: function (url, featureType, version, callback) {
            $.ajax({
                url: url,
                context: this,
                data: "service=WFS&version=" + version + "&request=DescribeFeatureType&typename=" + featureType,
                // parent (QueryModel) function
                success: callback
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

        collectAttributeValues: function (featureAttributesMap) {
            return this.getRemainingAttributeValues(featureAttributesMap);
        },

        /**
 * [description]
 * @param  {[type]} typeMap [description]
 * @return {[type]}         [description]
 */
// collectAttributeValues: function (featureAttributesMap) {
//
//         var values = [],
//             features = this.get("features");
//
//     _.each(featureAttributesMap, function (featureAttribute) {
//         values = [];
//         _.each(features, function (feature) {
//             if (featureAttribute.type === "boolean") {
//                 if (feature.get(featureAttribute.name) === "true") {
//                     values.push("Ja");
//                     feature.set(featureAttribute.name, "Ja");
//                 }
//                 else {
//                     values.push("Nein");
//                     feature.set(featureAttribute.name, "Nein");
//                 }
//             }
//             else {
//                 var stringValues = this.parseStringType(feature, featureAttribute);
//
//                 values = _.union(values, stringValues);
//             }
//         }, this);
//         featureAttribute.values = _.unique(values);
//     }, this);
//
//     return featureAttributesMap;
// },

        /**
         * [description]
         * @param  {[type]} typeMap [description]
         * @return {[type]}         [description]
         */
        getRemainingAttributeValues: function (featureAttributesMap, features) {
            var features = features || this.get("features");

            _.each(featureAttributesMap, function (featureAttribute) {
                featureAttribute.values = [];

                _.each(features, function (feature) {

                    featureAttribute.values = _.union(featureAttribute.values, this.parseStringType(feature, featureAttribute));
                }, this);
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
            return _.unique(values);
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
        runFilter: function (model) {
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
                    var isMatch = this.isFilterMatch(feature, attributes);
                    if (isMatch) {
                        featureIds.push(feature.getId());
                    }
                }, this);
            }
            else {
                _.each(features, function (feature) {
                    featureIds.push(feature.getId());
                }, this);
            }
            this.collectSelectableOptions(features, attributes);

            this.setFeatureIds(featureIds);
            this.trigger("featureIdsChanged");
        },



        collectSelectableOptions: function (features, attributes) {
            var selectableOptions = [];
            if(attributes.length === 0) {
           /*     attributes = this.get("featureAttributesMap");
                _.each(attributes, function (attribute) {
                    var selectableValues =  {name: attribute.name, values: []};

                    _.each(features, function (feature) {
                        selectableValues.values.push(feature.get(attribute.name));
                    });
                    selectableValues.values = _.unique(selectableValues.values);
                    selectableOptions.push(selectableValues);
                });*/
                selectableOptions = this.getRemainingAttributeValues(this.get("featureAttributesMap"), features);

            }
            else {
                var attributesMap = this.get("featureAttributesMap");
                _.each(attributesMap, function (attribute) {
                        var selectableValues =  {name: attribute.name, values: []};
                    _.each(features, function (feature) {
                        var isMatch = this.isFilterMatch(feature, _.filter(attributes, function (attr) {return attr.attrName !== attribute.name}));

                        if (isMatch) {
                            if(feature.get("kapitelbezeichnung") === "Grundschulen"  && attribute.name === "schulform") {
                               // debugger;
                            }
                            selectableValues.values.push(this.parseStringType(feature, attribute));//feature.get(attribute.name));
                        }
                    }, this);
                    selectableValues.values = _.unique(_.flatten(selectableValues.values));
                    selectableOptions.push(selectableValues);
                }, this);
            }

            // console.log(selectableOptions);
            this.updateSnippets(selectableOptions);

        },

        updateSnippets: function (selectableOptions) {
            var snippets = this.get("snippetCollection");

            _.each(snippets.models, function (snippet) {
                    snippet.resetValues();
                    var attribute = _.find(selectableOptions, {name: snippet.get("name")});
                    snippet.updateSelectableValues(attribute.values);
            });


            /*var featureAttributesMap = this.getRemainingAttributeValues(featureAttributesMap, featureIds),
                snippets = this.get("snippetCollection");

                _.each(snippets.models, function (snippet) {
                    snippet.resetValues();
                    var attribute = _.find(featureAttributesMap, {name: snippet.get("name")});

                    if (!_.isUndefined(attribute)) {
                        if(!_.isUndefined(model) && model.get("isSelected")) {
                            if (snippet.get("name") !== model.get("attr")) {
                               snippet.updateValues(attribute.values);
                            }
                        }
                        else {
                            snippet.updateValues(attribute.values);
                        }
                    }
                });*/
               //this.trigger("rerenderSnippets", model);
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
        },
        setFeatures: function (value) {
            this.set("features", value);
        }
    });

    return WfsQueryModel;
});
