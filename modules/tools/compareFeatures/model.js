define(function () {

    var CompareFeaturesModel;

    CompareFeaturesModel = Backbone.Model.extend({
        defaults: {
            // true if the tool is activated
            isActivated: false,
            // the comparable features
            featureList: [],
            // the comparable features group by layer
            groupedFeatureList: [],
            // max number of features to be displayed per layer
            maxFeatures: 3
        },
        initialize: function () {
            var channel = Radio.channel("CompareFeatures");

            channel.on({
                "setIsActivated": this.setIsActivated,
                "addFeatureToList": this.addFeatureToList,
                "removeFeatureFromList": this.removeFeatureFromList
            }, this);
        },

        /**
         * adds a feature to the featureList if possible
         * @param {ol.feature} feature - feature to be compared
         * @returns {void}
         */
        addFeatureToList: function (feature) {
            if (!this.isFeatureListFull(feature.get("layerId"), this.get("groupedFeatureList"), this.get("maxFeatures"))) {
                this.setFeatureIsOnCompareList(feature, true);
                this.get("featureList").push(feature);
                // after the list has been updated, it is regrouped
                this.setGroupedFeatureListByLayer(this.groupedFeaturesBy(this.get("featureList"), "layerId"));
                // render zwischenfenster Objekt wurde zur Vergleichliste hinzugefügt
            }
            else {
                // render zwischenfenster Die maximale zahl an Objekten im Vergleich wurde erreicht
            }
        },

        /**
         * removes a features from the featureList and sets the features attrbiute 'isOnCompareList' to false
         * @param {ol.feature} featureToRemoved - feature to be removed form the featureList
         * @returns {void}
         */
        removeFeatureFromList: function (featureToRemoved) {
            var featureIndex = _.findIndex(this.get("featureList"), function (feature) {
                return feature.get("id") === featureToRemoved.get("id");
            });

            this.setFeatureIsOnCompareList(featureToRemoved, false);
            this.get("featureList").splice(featureIndex, 1);
            // after the list has been updated, it is regrouped
            this.setGroupedFeatureListByLayer(this.groupedFeaturesBy(this.get("featureList"), "layerId"));
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
         * @param {number} maxFeatures - max number of features per layer
         * @returns {boolean} true - if the max number of features per layer has not been reached
         */
        isFeatureListFull: function (layerId, groupedFeatureList, maxFeatures) {
            if (typeof groupedFeatureList[layerId] === "undefined") {
                return false;
            }
            else if (groupedFeatureList[layerId].length < maxFeatures) {
                return false;
            }
            return true;
        },

        /**
         * @param {object} value - features grouped by layerId
         * @returns {void}
         */
        setGroupedFeatureListByLayer: function (value) {
            this.set("groupedFeatureList", value);
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
