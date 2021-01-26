import QueryModel from "../model";
import {intersects} from "ol/extent.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

const SourceModel = QueryModel.extend({
    defaults: {
        isAutoRefreshing: false,
        isInitialLoad: true
    },
    initializeFunction: function () {
        const modelList = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

        this.superInitialize();
        this.prepareQuery();
        if (this.get("searchInMapExtent") === true) {
            Radio.trigger("Map", "registerListener", "moveend", this.isSearchInMapExtentActive.bind(this), this);
        }
        if (modelList && modelList.get("autoRefresh")) {
            this.set("isAutoRefreshing", true);
            this.listenToFeaturesLoaded();
        }
    },

    /**
     * gathers Information for this Query including the features and metadata
     * @return {ol.Feature[]} openlayers Features
     */
    prepareQuery: function () {
        const layerId = this.get("layerId"),
            features = this.getFeaturesByLayerId(layerId);

        if (features.length > 0) {
            this.processFeatures(features);
            this.setIsInitialLoad(false);
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
        const featureIds = [];

        features.forEach(feature => {
            featureIds.push(feature.getId());
        });
        return featureIds;
    },
    /**
     * Waits for the Layer to load its features and proceeds requests the metadata
     * @return {void}
     */
    listenToFeaturesLoaded: function () {
        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": function (layerId, features) {
                const filters = Radio.request("ParametricURL", "getFilter");
                let urlFilterRules = [];

                if (layerId === this.get("layerId")) {
                    if (this.get("snippetCollection").length > 0 && this.get("isAutoRefreshing") && !this.get("isInitialLoad") && filters) {
                        urlFilterRules = filters.filter(function (urlFilters) {
                            const name = Radio.request("Filter", "getFilterName", layerId);

                            return urlFilters.name === name;
                        }, this);
                        this.createQueryFromUrlFilterRules(urlFilterRules[0]);
                        this.get("snippetCollection").reset(null);
                        this.processFeatures(features);
                    }
                    else if (this.get("isInitialLoad")) {
                        this.processFeatures(features);
                        this.setIsInitialLoad(false);

                        if (!this.get("isAutoRefreshing")) {
                            this.stopListening(Radio.channel("VectorLayer"), "featuresLoaded");
                        }
                    }
                }
            }
        });
    },

    /**
     * request the features for layer with its ID
     * @param {String} layerId ID of Layer
     * @return {Object} - olFeatures
     */
    getFeaturesByLayerId: function (layerId) {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
        let layerSource,
            features = [];

        if (model !== undefined) {
            layerSource = model.get("layerSource");
            layerSource = this.retrieveLayerSource(layerSource, layerId);
            features = layerSource.getFeatures();
        }
        return features;
    },

    /**
     * delivers the layerSource from an layer,
     * by grouplayer delivers the layerSource from child by layerid
     * @param {object} layerSource from layer
     * @param {number} layerId id from layer
     * @returns {object} layerSource
     */
    retrieveLayerSource: function (layerSource, layerId) {
        let layer,
            groupLayerSource = layerSource;

        if (Array.isArray(layerSource)) {
            layer = layerSource.find(child => child.get("id") === layerId);
            groupLayerSource = layer.get("layerSource");
        }

        return groupLayerSource;
    },

    buildQueryDatastructure: function () {
        const layerObject = getLayerWhere({id: this.get("layerId")});

        if (this.get("searchInMapExtent") === true) {
            this.addSearchInMapExtentSnippet();
        }
        if (layerObject !== undefined) {
            this.buildQueryDatastructureByType(layerObject);
        }
    },

    /**
     * Extract Attribute names and types from DescribeFeatureType-Response
     * @param  {XML} response response xml from ajax call
     * @return {object} - Mapobject containing names and types
     */
    parseResponse: function (response) {
        const elements = $("element", response),
            featureAttributesMap = [];

        elements.forEach(element => {
            featureAttributesMap.push({name: $(element).attr("name"), type: $(element).attr("type")});
        });
        this.createSnippets(featureAttributesMap);
    },

    /**
     * [getValuesFromFeature description]
     * @param  {ol.feature} feature olfeature
     * @param  {string} attrName [description]
     * @return {string[]} [description]
     */
    getValuesFromFeature: function (feature, attrName) {
        const values = this.parseValuesFromString(feature, attrName);

        return [...new Set(values)];
    },

    /**
     * parses attribute values with pipe-sign ("|") and returnes array with single values
     * @param  {ol.feature} feature olfeature
     * @param  {string} attributeName - key name of a feature attribute
     * @return {string[]} array of string[] || number[]
     */
    parseValuesFromString: function (feature, attributeName) {
        const values = [],
            attributeValue = feature.get(attributeName);
        let attributeValues = [];

        if (attributeValue !== undefined) {
            if (typeof attributeValue === "string" && attributeValue.indexOf("|") !== -1) {
                attributeValues = attributeValue.split("|");

                attributeValues.forEach(value => {
                    if (this.isValid(value)) {
                        values.push(this.trimValue(value));
                    }
                });
            }
            else if (Array.isArray(attributeValue)) {
                attributeValue.forEach(value => {
                    if (this.isValid(value)) {
                        values.push(this.trimValue(value));
                    }
                });
            }
            else if (this.isValid(attributeValue)) {
                values.push(this.trimValue(attributeValue));
            }
        }
        return [...new Set(values)];
    },
    isValid: function (value) {
        return value !== null && value !== undefined;
    },
    trimValue: function (value) {
        let trimmedValue = value;

        if (typeof value === "string") {
            trimmedValue = value.trim();
        }
        return trimmedValue;
    },
    /**
     * Collect the feature Ids that match the predefined rules
     * and trigger them to the ModelList
     * @returns {ol.feature[]} features that passed the predefined rules
     */
    runPredefinedRules: function () {
        const features = this.get("features"),
            newFeatures = [];

        if (this.get("predefinedRules") !== undefined && this.get("predefinedRules").length > 0) {
            features.forEach(feature => {
                this.get("predefinedRules").forEach(rule => {
                    if (rule.values.includes(feature.get(rule.attrName))) {
                        newFeatures.push(feature);
                    }
                });
            });
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
     * @return {void}
     */
    runFilter: function () {
        const features = this.runPredefinedRules(),
            selectedAttributes = [],
            featureIds = [];

        this.get("snippetCollection").forEach(function (snippet) {
            if (snippet.hasSelectedValues() === true) {
                selectedAttributes.push(snippet.getSelectedValues());
            }
        });

        if (selectedAttributes.length > 0) {
            features.forEach(feature => {
                const isMatch = this.isFilterMatch(feature, selectedAttributes);

                if (isMatch) {
                    featureIds.push(feature.getId());
                }
            });
        }
        else {
            features.forEach(feature => {
                featureIds.push(feature.getId());
            });
        }

        this.updateSnippets(features, selectedAttributes);
        this.setFeatureIds(featureIds);
        this.trigger("featureIdsChanged", featureIds, this.get("layerId"));
    },

    sendFeaturesToRemote: function () {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
            features = [];
        let feature;

        this.get("featureIds").forEach(id => {
            feature = model.get("layerSource").getFeatureById(id);
            feature.set("extent", feature.getGeometry().getExtent());
            features.push(Radio.request("Util", "omit", feature.getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]));
        });

        Radio.trigger("RemoteInterface", "postMessage", {"features": JSON.stringify(features), "layerId": model.get("id"), "layerName": model.get("name")});
    },
    /**
     * determines the attributes and their values that are still selectable
     * @param  {ol.Feature[]} features olfeatures
     * @param  {object[]} selectedAttributes attribute object
     * @param  {object[]} [allAttributes=[]]      array of all attributes and their values
     * @return {object[]}                    array of attributes and their values that are still selectable
     */
    collectSelectableOptions: function (features, selectedAttributes, allAttributes = []) {
        const selectableOptions = [];
        let selectableValues = [];

        allAttributes.forEach(attribute => {
            selectableValues = {name: attribute.name, displayName: attribute.displayName, type: attribute.type, values: [], matchingMode: attribute.matchingMode};

            features.forEach(feature => {
                const isMatch = this.isFilterMatch(feature, selectedAttributes.filter(function (attr) {
                    return attr.attrName !== attribute.name;
                }));

                if (isMatch) {
                    selectableValues.values.push(this.parseValuesFromString(feature, attribute.name));
                }
            });
            selectableValues.values = [...new Set(Array.isArray(selectableValues.values) ? selectableValues.values.reduce((acc, val) => acc.concat(val), []) : selectableValues.values)];
            selectableOptions.push(selectableValues);
        });

        return selectableOptions;
    },
    /**
     * after every filtering the snippets get updated with selectable values
     * @param  {ol.Feature[]} features features
     * @param  {object[]}     selectedAttributes [description]
     * @returns {void}
     */
    updateSnippets: function (features, selectedAttributes) {
        const snippets = this.get("snippetCollection"),
            selectableOptions = this.collectSelectableOptions(features, selectedAttributes, this.get("featureAttributesMap"));

        snippets.where({"snippetType": "dropdown"}).forEach(snippet => {
            let attribute = {};

            snippet.resetValues();
            attribute = selectableOptions.find(option => option.name === snippet.get("name"));

            snippet.updateSelectableValues(attribute.values);
        });
    },
    /**
     * checks if feature hat attribute that contains value
     * @param  {ol.Feature}  feature olfeature
     * @param  {object}      attribute attributeObject
     * @return {Boolean}               true if feature has attribute that contains value
     */
    isValueMatch: function (feature, attribute) {
        const featureMap = this.get("featureAttributesMap").find(featureAttribute => featureAttribute.name === attribute.attrName);

        attribute.matchingMode = featureMap.matchingMode;
        return attribute.matchingMode === "OR" ? this.isORMatch(feature, attribute) : this.isANDMatch(feature, attribute);
    },
    isORMatch: function (feature, attribute) {
        let isMatch = false;

        isMatch = attribute.values.find(value => {
            return this.containsValue(feature, attribute, value);
        });
        return isMatch !== undefined;
    },
    isANDMatch: function (feature, attribute) {
        return attribute.values.every(value => this.containsValue(feature, attribute, value));
    },
    containsValue: function (feature, attribute, value) {
        if (feature.get(attribute.attrName) !== undefined) {
            return feature.get(attribute.attrName).indexOf(value) !== -1;
        }
        return false;
    },
    /**
     * checks if a value is within a range of values
     * @param  {ol.Feature} feature olfeature
     * @param  {string} attributeName name of attribute
     * @param  {number[]} values arra of values
     * @return {boolean} flag if value is in range
     */
    isNumberInRange: function (feature, attributeName, values) {
        const featureValue = feature.get(attributeName),
            valueList = Object.assign([], values);
        let isNumberInRange = false;

        valueList.push(featureValue);
        valueList.sort((valueA, valueB) => valueA - valueB);

        isNumberInRange = valueList[1] === featureValue;

        return isNumberInRange;
    },

    isFeatureInExtent: function (feature) {
        const mapExtent = Radio.request("MapView", "getCurrentExtent");

        return intersects(mapExtent, feature.getGeometry().getExtent());
    },

    /**
     * checks if feature matches the filter
     * @param  {ol.Feature}  feature    [description]
     * @param  {object[]}    filterAttr array of attributes and their values to filter
     * @return {Boolean}            [description]
     */
    isFilterMatch: function (feature, filterAttr) {
        let isMatch = false;

        isMatch = filterAttr.every(attribute => {
            if (feature.get(attribute.attrName) === null) {
                return false;
            }
            else if (attribute.type === "integer" || attribute.type === "decimal") {
                return this.isNumberInRange(feature, attribute.attrName, attribute.values);
            }
            else if (attribute.type === "searchInMapExtent") {
                return this.isFeatureInExtent(feature);
            }

            return this.isValueMatch(feature, attribute);
        });

        return isMatch;
    },

    setFeatures: function (value) {
        this.set("features", value);
    },

    /**
     * creates Query from Url-Filterobject
     * @param  {object[]} obj array of attributes and their values to filter
     * @return {void}
     */
    createQueryFromUrlFilterRules: function (obj) {
        Object.keys(obj).forEach(function (key) {
            this.set(key, obj[key]);
        }, this);
    }
});

export default SourceModel;
