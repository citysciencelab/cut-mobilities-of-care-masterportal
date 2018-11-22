import SourceModel from "./model";

const GeoJsonQueryModel = SourceModel.extend({
    initialize: function () {
        this.initializeFunction();
    },

    buildQueryDatastructureByType: function () {
        var features = this.get("features"),
            snippetType = this.get("snippetType"),
            featureAttributesMap = [];

        featureAttributesMap = this.createFeatureAttributesMap(features, snippetType);

        this.createSnippets(featureAttributesMap);
    },

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
