import SourceModel from "./model";

const GeoJsonQueryModel = SourceModel.extend({
    initialize: function () {
        this.initializeFunction();
    },
    /**
     * Gets the features for the Layer asscociated with this Query
     * and proceeds to build the datastructure including the snippets for this query
     * @returns {void}
     */
    buildQueryDatastructureByType: function () {
        var features = this.get("features"),
            snippetType = this.get("snippetType"),
            featureAttributesMap = [];

        featureAttributesMap = this.createFeatureAttributesMap(features, snippetType);

        this.createSnippets(featureAttributesMap);
    },

    /**
     * Creates a feature set with only one snippetType
     * @param  {array} features - GeoJson Features from file
     * @param  {string} snippetType - snippetType from filter configuration
     * @returns {void}
     */
    createFeatureAttributesMap: function (features, snippetType) {
        var featureAttributesMap = [],
            firstFeature = !_.isUndefined(features) ? features[0] : undefined,
            keys = !_.isUndefined(firstFeature) ? _.without(firstFeature.getKeys(), "geometry") : [];

        _.each(keys, function (key) {
            var type = !_.isUndefined(snippetType) ? String(snippetType) : typeof firstFeature.get(key);

            featureAttributesMap.push({name: key, type: type});
        });
        return featureAttributesMap;
    }
});

export default GeoJsonQueryModel;
