define(function () {

    var CompareFeaturesModel;

    CompareFeaturesModel = Backbone.Model.extend({
        defaults: {
            // true if the tool is activated
            isActivated: false,
            // all comparable features
            featureList: [],
            // the comparable features group by layer
            groupedFeatureList: [],
            // layer id of the displayed features
            layerId: undefined,
            // number of features to be displayed per layer
            numberOfFeaturesToShow: 3,
            // number of attributes to be displayed
            numberOfAttributesToShow: 11
        },
        initialize: function () {
            var channel = Radio.channel("CompareFeatures");

            channel.on({
                "setIsActivated": this.setIsActivated,
                "addFeatureToList": function (feature) {
                    var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: feature.get("layerId")});

                    this.addFeatureToList(feature, layerModel.get("gfiAttributes"));
                },
                "removeFeatureFromList": this.removeFeatureFromList
            }, this);

            this.overwriteDefaults();
        },

        overwriteDefaults: function () {
            var config = Radio.request("Parser", "getItemByAttributes", {id: "compareFeatures"});

            _.each(config, function (value, key) {
                this.set(key, value);
            }, this);
        },

        /**
         * adds a feature to the featureList if possible
         * @param {ol.feature} feature - feature to be compared
         * @param {obj} gfiAttributes -
         * @returns {void}
         */
        addFeatureToList: function (feature, gfiAttributes) {
            if (!this.isFeatureListFull(feature.get("layerId"), this.get("groupedFeatureList"), this.get("numberOfFeaturesToShow"))) {
                this.setLayerId(feature.get("layerId"));
                this.setFeatureIsOnCompareList(feature, true);
                this.beautifyAttributes(feature);
                this.get("featureList").push(feature);
                // after the list has been updated, it is regrouped
                this.setGroupedFeatureListByLayer(this.groupedFeaturesBy(this.get("featureList"), "layerId"));
                this.prepareCompareTable(this.get("groupedFeatureList")[this.get("layerId")], this.get("numberOfAttributesToShow"), gfiAttributes);
            }
            this.trigger("renderFeedbackModal", feature);
        },

        /**
         * removes a features from the featureList and sets the features attrbiute 'isOnCompareList' to false
         * @param {ol.feature} featureToRemoved - feature to be removed form the featureList
         * @returns {void}
         */
        removeFeatureFromList: function (featureToRemoved) {
            var featureIndex = _.findIndex(this.get("featureList"), function (feature) {
                return feature.getId() === featureToRemoved.getId();
            });

            if (featureIndex !== -1) {
                this.setFeatureIsOnCompareList(featureToRemoved, false);
                this.get("featureList").splice(featureIndex, 1);
                // after the list has been updated, it is regrouped
                this.setGroupedFeatureListByLayer(this.groupedFeaturesBy(this.get("featureList"), "layerId"));
            }
        },

        prepareCompareTable: function (featureList, minAttr, gfiAttributes) {
            var rows = [];

            Object.keys(gfiAttributes).forEach(function (key) {
                var obj = {};

                obj["col-1"] = gfiAttributes[key];
                featureList.forEach(function (feature, idx) {
                    obj["col-" + (idx + 2)] = feature.get(key);
                });
                rows.push(obj);
                // return index === minAttr;
            });
            this.set("rows", rows);
        },

        /**
         * splits the features into sets, grouped by the given property
         * @param {ol.feature[]} featureList - the comparable features
         * @param {string} property - value is grouped by
         * @returns {object} object grouped by property
         */
        groupedFeaturesBy: function (featureList, property) {
            return _.groupBy(featureList, function (feature) {
                return feature.get(property);
            });
        },

        /**
         * sets the feature attribute 'isOnCompareList'
         * @param {ol.feature} feature - to be added to or removed from the list
         * @param {boolean} value - shows if the feature is on the compare list
         * @returns {void}
         */
        setFeatureIsOnCompareList: function (feature, value) {
            feature.set("isOnCompareList", value);
        },

        /**
         * checks if the list has already reached the maximum number of features per layer
         * @param {string} layerId - layer id of the feature
         * @param {object} groupedFeatureList - features grouped by layerId
         * @param {number} numberOfFeaturesToShow - max number of features per layer
         * @returns {boolean} true - if the max number of features per layer has not been reached
         */
        isFeatureListFull: function (layerId, groupedFeatureList, numberOfFeaturesToShow) {
            if (typeof groupedFeatureList[layerId] === "undefined") {
                return false;
            }
            else if (groupedFeatureList[layerId].length < numberOfFeaturesToShow) {
                return false;
            }
            return true;
        },

        beautifyAttributes: function (feature) {
            Object.keys(feature.getProperties()).forEach(function (key) {
                if (typeof feature.get(key) === "string" && feature.get(key).indexOf("|") !== -1) {
                    feature.set(key, feature.get(key).split("|"));
                }
            });
        },

        /**
         * @param {object} value - features grouped by layerId
         * @returns {void}
         */
        setGroupedFeatureListByLayer: function (value) {
            this.set("groupedFeatureList", value);
        },

        /**
         * @param {string} value - layer id of the displayed features
         * @returns {void}
         */
        setLayerId: function (value) {
            this.set("layerId", value);
        },

        /**
         * @param {boolean} value - true if the tool is activated
         * @returns {void}
         */
        setIsActivated: function (value) {
            this.set("isActivated", value);
        }
    });

    return CompareFeaturesModel;
});
