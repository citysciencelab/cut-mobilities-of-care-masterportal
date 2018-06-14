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
            // max number of featurs to be displayed
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
         * @param {object} compareObject -
         * @param {ol.feature} compareObject.feature - feature to be compared
         * @param {string} compareObject.layerId - the layer id for the given feature
         * @param {string} compareObject.name - the layer name for thie given feature
         * @returns {void}
         */
        addFeatureToList: function (compareObject) {
            if (this.isFeatureListFull(compareObject.layerId, this.get("groupedFeatureList"), this.get("maxFeatures"))) {
                this.get("featureList").push(compareObject);
                this.setGroupedFeatureList(_.groupBy(this.get("featureList"), "layerId"));
                compareObject.feature.set("isOnCompareList", true);
                // render zwischenfenster Objekt wurde zur Vergleichliste hinzugefügt
            }
            else {
                // render zwischenfenster Die maximale zahl an Objekten im Vergleich wurde erreicht
            }
        },

        removeFeatureFromList: function () {
            console.log("removeFeatureFromList");
        },

        /**
         * @param {string} layerId -
         * @param {string} groupedFeatureList -
         * @param {string} maxFeatures -
         * @returns {boolean} true if
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
         * @param {boolean} value -
         * @returns {void}
         */
        setIsActivated: function (value) {
            this.set("isActivated", value);
        },

        setGroupedFeatureList: function (value) {
            this.set("groupedFeatureList", value);
        }
    });

    return CompareFeaturesModel;
});
