import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import {Heatmap} from "ol/layer.js";

const HeatmapLayer = Layer.extend({

    defaults: _.extend({}, Layer.prototype.defaults, {
        radius: 10,
        blur: 15,
        gradient: [
            "#00f", "#0ff", "#0f0", "#ff0", "#f00"
        ]
    }),

    initialize: function () {
        var channel = Radio.channel("HeatmapLayer");

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        this.listenTo(channel, {
            "loadInitialData": this.loadInitialData,
            "loadupdateHeatmap": this.loadupdateHeatmap
        });
    },

    loadInitialData: function (layerId, features) {
        if (this.checkDataLayerId(layerId)) {
            this.initializeHeatmap(features);
        }
    },

    loadupdateHeatmap: function (layerId, feature) {
        if (this.checkDataLayerId(layerId)) {
            this.updateHeatmap(feature);
        }
    },

    /**
     * creates ol.source.Vector as LayerSource
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
    },

    /**
     * creates the heatmapLayer
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new Heatmap({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            id: this.get("id"),
            weight: function (feature) {
                return feature.get("normalizeWeightForHeatmap");
            },
            gfiAttributes: this.get("gfiAttributes"),
            blur: this.get("blur"),
            radius: this.get("radius"),
            gradient: this.get("gradient")
        }));
    },

    /**
     * check the triggered id with given the layerid
     * @param  {String} layerId - id from layer
     * @returns {void}
     */
    checkDataLayerId: function (layerId) {
        return this.get("dataLayerId") === layerId;
    },

    /**
     * draw heatmap with initialize features
     * @param  {[Ol.Feature]} features - all features from associated sensorLayer
     * @returns {void}
     */
    initializeHeatmap: function (features) {
        var attribute = this.get("attribute"),
            value = this.get("value"),
            layerSource = this.get("layerSource"),
            cloneFeatures = [];

        _.each(features, function (feature) {
            var cloneFeature = feature.clone(),
                count;

            if (!_.isUndefined(attribute || value)) {
                count = this.countStates(feature, attribute, value);

                cloneFeature.set("weightForHeatmap", count);
            }

            cloneFeature.setId(feature.getId());
            cloneFeatures.push(cloneFeature);
        }, this);

        layerSource.addFeatures(cloneFeatures);

        // normalize weighting
        if (!_.isUndefined(attribute || value)) {
            this.normalizeWeight(layerSource.getFeatures());
        }
    },
    createLegendURL: function () {
        console.error("legendURL for heatmap not yet implemented");
    },

    /**
     * update the heatmap with given feature
     * @param  {Ol.Feature} feature - feature to be update
     * @return {void}
     */
    updateHeatmap: function (feature) {
        var attribute = this.get("attribute"),
            value = this.get("value"),
            layerSource = this.get("layerSource"),
            featureId = feature.getId(),
            cloneFeature = feature.clone(),
            heatmapFeature,
            count;

        cloneFeature.setId(featureId);

        // check is feature exist
        _.each(layerSource.getFeatures(), function (feat) {
            if (feat.getId() === featureId) {
                heatmapFeature = feat;
            }
        });

        // insert weighting
        if (!_.isUndefined(attribute || value)) {
            count = this.countStates(feature, attribute, value);

            cloneFeature.set("weightForHeatmap", count);
        }

        // if the feature is new, then pushes otherwise change it
        if (_.isUndefined(heatmapFeature)) {
            layerSource.addFeature(cloneFeature);
        }
        else {
            layerSource.removeFeature(layerSource.getFeatureById(cloneFeature.getId()));
            layerSource.addFeature(cloneFeature);
        }

        // normalize weighting
        if (!_.isUndefined(attribute || value)) {
            this.normalizeWeight(layerSource.getFeatures());
        }
    },

    /**
     * normalizes the values to a scale from 0 to 1
     * @param  {[Ol.Feature]} featuresWithValue - features that have a value
     * @returns {void}
     */
    normalizeWeight: function (featuresWithValue) {
        var max = _.max(featuresWithValue, function (feature) {
            return feature.get("weightForHeatmap");
        }).get("weightForHeatmap");

        _.each(featuresWithValue, function (feature) {
            feature.set("weightForHeatmap", feature.get("weightForHeatmap") / max);
        });
    },

    /**
     * count given states of a feature
     * @param  {Ol.Feature} feature - feature
     * @param  {string} heatmapAttribute - attribute that contains the value
     * @param  {string} heatmapValue - value
     * @return {[String]} count
     */
    countStates: function (feature, heatmapAttribute, heatmapValue) {
        var state = String(feature.get(heatmapAttribute)),
            states,
            count;

        // split features with multiple values
        if (state.indexOf("|") !== -1) {
            states = state.split(" | ");
        }
        else {
            states = [state];
        }

        count = $.grep(states, function (oneState) {
            return oneState === heatmapValue;
        }).length;

        return count;
    },

    /**
    * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
    * @param {object} options -
    * @returns {void}
    **/
    checkForScale: function (options) {
        if (parseFloat(options.scale, 10) <= this.get("maxScale") && parseFloat(options.scale, 10) >= this.get("minScale")) {
            this.setIsOutOfRange(false);
        }
        else {
            this.setIsOutOfRange(true);
        }
    },

    /**
     * Setter for attribute "layer"
     * @param {Ol.layer} value - HeatmapLayer
     * @returns {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * Setter for attribute "layerSource"
     * @param {Ol.source} value - HeatmapLayerSource
     * @returns {void}
     */
    setLayerSource: function (value) {
        this.set("layerSource", value);
    }
});

export default HeatmapLayer;
