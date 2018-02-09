define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        HeatmapLayer;

    HeatmapLayer = Layer.extend({

        defaults: _.extend({}, Layer.prototype.defaults,
            {
                radius: 10,
                blur: 15,
                gradient: ["#00f", "#0ff", "#0f0", "#ff0", "#f00"]
            }
        ),
        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("HeatmapLayer");

            this.listenTo(channel, {
                "checkDataLayerId": this.checkDataLayerId
            });
        },

        /**
         * creates ol.source.Vector as LayerSource
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        /**
         * creates the heatmapLayer
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Heatmap({
                source: this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                id: this.getId(),
                gfiAttributes: this.get("gfiAttributes"),
                weight: "weightForHeatmap",
                // weight: function (feature){
                //     return feature.get("weightForHeatmap");
                // },
                blur: this.get("heatmap").blur,
                radius: this.get("heatmap").radius,
                gradient: this.get("gradient")
            }));
        },

        /**
         * check the triggered id with given the layerid
         * and start updateHeatmap
         * @param  {String} layerId
         * @param  {[ol.feature]} features
         */
        checkDataLayerId: function (layerId, features) {
            if (this.get("dataLayerId") === layerId) {
                this.updateHeatmap(features);
            }
        },

        /**
         * updates the heatmap with given features
         * and set features to layerSource
         * @param  {[ol.feature]} features
         */
        updateHeatmap: function (features) {
            var heatmapAttribute = this.get("heatmap").attribute,
                heatmapValue = this.get("heatmap").value,
                heatmapLayerSource = this.getLayerSource(),
                featuresWithValue,
                normalizeFeatures;

            heatmapLayerSource.clear();

            // count features with multiple heatmapAttributes
            if (!_.isUndefined(heatmapAttribute && heatmapValue)) {
                _.each(features, function (feature) {
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

                    count = $.grep(states, function (state) {
                        return state === heatmapValue;
                    }).length;

                    feature.set("weightForHeatmap", count);
                });

                features = this.normalizeWeight(features);
            }

            heatmapLayerSource.addFeatures(features);
        },

        /**
         * normalizes the values to a scale from 0 to 1
         * @param  {[ol.Feature]} featuresWithValue
         * @return {[ol.Feature]} featuresWithValue
         */
        normalizeWeight: function (featuresWithValue) {
            var max = _.max(featuresWithValue, function (feature) {
                    return feature.get("weightForHeatmap");
                }).get("weightForHeatmap");

                _.each(featuresWithValue, function(feature) {
                    feature.set("weightForHeatmap", (feature.get("weightForHeatmap") / max));
                });

                return featuresWithValue;
        },

        /**
         * Setter for attribute "layer"
         * @param {ol.layer} value
         */
        setLayer: function (value) {
            this.set("layer", value);
        },

        /**
         * Setter for attribute "layerSource"
         * @param {ol.source} value
         */
        setLayerSource: function (value) {
            this.set("layerSource", value);
        },

        /*
         * Getter for attribute "layerSource"
         * @return {ol.source}
        */
        getLayerSource: function () {
            return this.get("layerSource");
        }
    });

    return HeatmapLayer;
});
