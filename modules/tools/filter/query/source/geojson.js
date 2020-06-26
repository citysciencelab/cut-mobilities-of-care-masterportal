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
        const features = this.get("features"),
            snippetType = this.get("snippetType");
        let featureAttributesMap = [];

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
        const featureAttributesMap = [],
            firstFeature = features !== undefined ? features[0] : undefined,
            keys = firstFeature !== undefined ? firstFeature.getKeys().filter(feature => feature !== "geometry") : [];

        keys.forEach(key => {
            const type = snippetType !== undefined ? String(snippetType) : typeof firstFeature.get(key);

            featureAttributesMap.push({name: key, type: type});
        });
        return featureAttributesMap;
    }
});

export default GeoJsonQueryModel;
