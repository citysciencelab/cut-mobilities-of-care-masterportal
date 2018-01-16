define(function (require) {

    var QueryModel = require("modules/tools/filter/query/model"),
        ElasticQueryModel;

    ElasticQueryModel = QueryModel.extend({
        initialize: function () {
            this.superInitialize();
            var that = this;
            setTimeout(function(){
                that.prepareQuery();
            },1000, that);
        },
        /**
         * gathers Information for this Query including the wfs features and metadata
         * waits for WFS features to be loaded if they aren't loaded already.
         * @return {ol.Feature[]}
         */
        prepareQuery: function () {
            var features = this.getFeaturesFromWFS();

            if (features.length > 0) {
                this.processFeatures(features);
            }
            else {
                this.listenToFeaturesLoaded();
            }
            return features;
        },
        processFeatures: function (features) {
            this.setFeatures(features);
            this.setFeatureIds(this.collectAllFeatureIds(features));
            this.buildQueryDatastructure();
        },
        collectAllFeatureIds: function (features) {
            var featureIds = [];

            _.each(features, function (feature) {
                featureIds.push(feature.getId());
            });
            return featureIds;
        },
        /**
         * Waits for the Layer to load its features and proceeds requests the metadata
         * @return {[type]} [description]
         */
        listenToFeaturesLoaded: function () {
            this.listenTo(Radio.channel("WFSLayer"), {
                "featuresLoaded": function (layerId, features) {
                    if (layerId === this.get("layerId")) {
                        this.processFeatures(features);
                    }
                }
            });
        },
        /**
         * request the features for this query from the modellist
         * @return {Object} - olFeatures
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
console.log(44);
            this.createSnippets([{name: "bezirk_name", type: "string"}, {name: "flst_status", type: "string"}]);
        },

        collectAttributeValues: function (featureAttributesMap) {
            return this.getRemainingAttributeValues(featureAttributesMap);
        },

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
         * [getValuesFromFeature description]
         * @param  {ol.feature} feature
         * @param  {string} attrName [description]
         * @return {[string]}          [description]
         */
        getValuesFromFeature: function (feature, attrName) {
            var values = this.parseValuesFromString(feature, attrName);

            return _.unique(values);
        },

        /**
         * parses attribut values with pipe-sign ("|") and returnes array with single values
         * @param  {ol.Feature} feature
         * @param  {[type]} featureAttribute [description]
         * @return {[type]}                  [description]
         */
        parseValuesFromString: function (feature, attrName) {
            var values = [];

            if (!_.isUndefined(feature.get(attrName))) {
                if (feature.get(attrName).indexOf("|") !== -1) {
                    var featureValues = feature.get(attrName).split("|");

                    _.each(featureValues, function (value) {
                        values.push(value);
                    });
                }
                else {
                    values.push(feature.get(attrName));
                }
            }
            return _.unique(values);
        },

        /**
         * Collect the feature Ids that match the predefined rules
         * and trigger them to the ModelList
         */
        runPredefinedRules: function () {
            var features = this.get("features"),
                newFeatures = [];

            if (!_.isUndefined(this.get("predefinedRules")) && this.get("predefinedRules").length > 0) {
                _.each(features, function (feature) {
                    _.each(this.get("predefinedRules"), function (rule) {
                        if (_.contains(rule.values, feature.get(rule.attrName))) {
                            newFeatures.push(feature);
                        }
                    });
                }, this);
            }
            else {
                return features;
            }

            return newFeatures;
        },
        /**
         * runs predefined rules,
         * determines selected values from snippets,
         * derives featureIds from matching Features and triggers "featureIdsChanged" to filterModel
         * @return {[type]} [description]
         */
        runFilter: function () {
            var features = this.runPredefinedRules(),
                selectedAttributes = [],
                featureIds = [];

            this.get("snippetCollection").forEach(function (snippet) {
                if (snippet.hasSelectedValues() === true) {
                    selectedAttributes.push(snippet.getSelectedValues());
                }
            });

            if (selectedAttributes.length > 0) {
                _.each(features, function (feature) {
                    var isMatch = this.isFilterMatch(feature, selectedAttributes);

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

            this.updateSnippets(features, selectedAttributes);
            this.setFeatureIds(featureIds);
            this.trigger("featureIdsChanged", featureIds);
        },
        /**
         * triggers map to zoom to given features of given layer
         * @return {[type]} [description]
         */
        zoomToSelectedFeatures: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

            if (window != window.top) {
                parent.postMessage({"featureIds": this.get("featureIds")}, "https://localhost:8080");
            }
            Radio.trigger("Map", "zoomToFilteredFeatures", this.get("featureIds"), this.get("layerId"));
        },
        /**
         * determines the attributes and their values that are still selectable
         * @param  {ol.Feature[]} features
         * @param  {object[]} selectedAttributes attribute object
         * @param  {object[]} allAttributes      array of all attributes and their values
         * @return {object[]}                    array of attributes and their values that are still selectable
         */
        collectSelectableOptions: function (features, selectedAttributes, allAttributes) {
            var selectableOptions = [];

            if (_.isUndefined(allAttributes) === false && allAttributes.length === 0) {
                selectableOptions = this.getRemainingAttributeValues(allAttributes, features);
            }
            else {
                _.each(allAttributes, function (attribute) {
                    var selectableValues = {name: attribute.name, values: []};

                    _.each(features, function (feature) {
                        var isMatch = this.isFilterMatch(feature, _.filter(selectedAttributes, function (attr) {
                            return attr.attrName !== attribute.name;
                        }));

                        if (isMatch) {
                            selectableValues.values.push(this.getValuesFromFeature(feature, attribute.name, attribute.type));
                        }
                    }, this);
                    selectableValues.values = _.unique(_.flatten(selectableValues.values));
                    selectableOptions.push(selectableValues);
                }, this);
            }
            return selectableOptions;
        },
        /**
         * after every filtering the snippets get updated with selectable values
         * @param  {ol.Feature[]} features
         * @param  {object[]}     selectedAttributes [description]
         */
        updateSnippets: function (features, selectedAttributes) {
            var snippets = this.get("snippetCollection"),
                selectableOptions = this.collectSelectableOptions(features, selectedAttributes, this.get("featureAttributesMap"));

            _.each(snippets.where({"snippetType": "dropdown"}), function (snippet) {
                snippet.resetValues();
                var attribute = _.find(selectableOptions, {name: snippet.get("name")});

                snippet.updateSelectableValues(attribute.values);
            });
        },
        /**
         * checks if feature hat attribute that contains value
         * @param  {ol.Feature}  feature
         * @param  {object}      attribute attributeObject
         * @return {Boolean}               true if feature has attribute that contains value
         */
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
         * @param  {ol.Feature} feature
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
        /**
         * checks if feature matches the filter
         * @param  {ol.Feature}  feature    [description]
         * @param  {object[]}    filterAttr array of attributes and their values to filter
         * @return {Boolean}            [description]
         */
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
         * @param  {ol.Feature} feature          [description]
         * @param  {object}     featureAttribute [description]
         * @return {string[]}
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

    return ElasticQueryModel;
});
