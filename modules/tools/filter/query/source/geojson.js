import SourceModel from "./model";
import {intersects} from "ol/extent.js";
import GeoJSON from "ol/format/GeoJSON";

const GeoJsonQueryModel = SourceModel.extend({
    initialize: function () {
        this.initializeFunction();
    },

    /**
     * delivers the layerSource from an layer,
     * by grouplayer delivers the layerSource from child by layerid
     * @param {object} layerSource from layer
     * @param {number} layerId id from layer
     * @returns {object} layerSource
     */
    retrieveLayerSource: function (layerSource, layerId) {
        var layer,
            groupLayerSource = layerSource;

        if (_.isArray(layerSource)) {
            layer = _.find(layerSource, function (child) {
                return child.get("id") === layerId;
            });
            groupLayerSource = layer.get("layerSource");
        }

        return groupLayerSource;
    },

    buildQueryDatastructureByType: function () {
        var features = this.get("features"),
            snippetType = this.get("snippetType"),
            featureAttributesMap = [];

        featureAttributesMap = this.createFeatureAttributesMap(features, snippetType);
        return featureAttributesMap;
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
