import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import {Heatmap} from "ol/layer.js";

const HeatmapLayer = Layer.extend(/**@lends HeatmapLayer.prototype */{

    defaults: _.extend({}, Layer.prototype.defaults, {
        radius: 10,
        blur: 15,
        gradient: [
            "#00f", "#0ff", "#0f0", "#ff0", "#f00"
        ]
    }),
    /**
     * @class HeatmapLayer
     * @description Module to represent HeatmapLayer
     * @extends Layer
     * @constructs
     * @memberOf Core.ModelList.Layer
     * @property {Number} radius=10 Radius to calculate the heatmap.
     * @property {Number} blur=15 Blur for heatmap.
     * @property {String[]} gradient=["#00f","#0ff","#0f0","#ff0","#f00"] Gradient of colors for heatmap.
     * @listens HeatmapLayer#RadioTriggerHeatmapLayerLoadInitialData
     * @listens HeatmapLayer#RadioTriggerHeatmapLayerLoadUpdateHeatmap
     */
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

    /**
     * Loads the initial heatmap features.
     * @param {String} layerId Id of layer whose data has to be loaded.
     * @param {ol/Feature[]} features Features that have to be used for heatmap layer.
     * @returns {void}
     */
    loadInitialData: function (layerId, features) {
        if (this.checkDataLayerId(layerId)) {
            this.initializeHeatmap(features);
        }
    },

    /**
     * Loads or updates the feature in the heatmap.
     * @param {String} layerId Id of layer whose data data has to be loaded
     * @param {ol/feature} feature  Feature that was updated.
     * @returns {void}
     */
    loadupdateHeatmap: function (layerId, feature) {
        if (this.checkDataLayerId(layerId)) {
            this.updateHeatmap(feature);
        }
    },

    /**
     * Creates an empty vectorSource as the layer source.
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
    },

    /**
     * Creates the heatmap layer.
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new Heatmap({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            id: this.get("id"),
            weight: function (feature) {
                return feature.get("weightForHeatmap");
            },
            gfiAttributes: this.get("gfiAttributes"),
            blur: this.get("blur"),
            radius: this.get("radius"),
            gradient: this.get("gradient")
        }));
    },

    /**
     * Checks if triggered layer id equals the id of current heatmap-layer.
     * @param  {String} layerId - id from layer
     * @returns {Boolean} - Flag if layerId matches the dataLayerId
     */
    checkDataLayerId: function (layerId) {
        return this.get("dataLayerId") === layerId;
    },

    /**
     * Draws the heatmap with initialize features
     * @param  {ol/Feature[]} features All features from associated sensorLayer
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
    /**
     * overwrites createlegendURL from class Layer. Is not yet implemented in heatmap layer.
     * @returns {void}
     */
    createLegendURL: function () {
        console.error("legendURL for heatmap not yet implemented");
    },

    /**
     * Updates the heatmap with given feature.
     * @param  {ol/Feature} feature Feature to be updated.
     * @returns {void}
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
     * Normalizes the values to a scale from 0 to 1.
     * @param  {ol/Feature[]} featuresWithValue Features that have a value.
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
     * Counts the given states of a feature.
     * @param  {ol/Feature} feature Feature.
     * @param  {string} heatmapAttribute Attribute that contains the value.
     * @param  {string} heatmapValue Value.
     * @return {String[]}  - count.
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
    * Checks by scale if layer is visible or not.
    * @param {object} options Options from mapView
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
     * Setter for attribute "layer".
     * @param {ol/Layer} value HeatmapLayer.
     * @returns {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * Setter for attribute "layerSource"
     * @param {ol/Source} value HeatmapLayerSource.
     * @returns {void}
     */
    setLayerSource: function (value) {
        this.set("layerSource", value);
    }
});

export default HeatmapLayer;
