
import "../model";

const VisibleVectorModel = Backbone.Model.extend(/** @lends VisibleVectorModel.prototype */{
    defaults: {
        inUse: false,
        minChars: 3,
        layerTypes: ["WFS"],
        gfiOnClick: false
    },
    /**
     * @class VisibleVectorModel
     * @description Initialisierung der visibleVector Suche
     * @extends Backbone.Model
     * @memberof Searchbar.VisibleVector
     * @constructs
     * @param {Object} config - Config JSON for Searchbar in visible vector layers
     * @param {integer} [config.minChars=3] - minimum character count to initialize a seach
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    initialize: function (config) {
        if (config.minChars) {
            this.setMinChars(config.minChars);
        }
        if (config.layerTypes) {
            this.setLayerTypes(config.layerTypes);
        }
        if (config.gfiOnClick) {
            this.setGfiOnClick(config.gfiOnClick);
        }
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.prepSearch
        });

    },

    /**
     * description
     * @todo description
     * @param {string} searchString String to search for in properties of all model's features
     * @returns {void}
     */
    prepSearch: function (searchString) {
        var sPrepSearchString,
            aVectorLayerModels = [],
            aFoundMatchingFeatures = [],
            aFilteredModels;

        if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
            this.setInUse(true);
            sPrepSearchString = searchString.replace(" ", "");

            _.each(this.getLayerTypes(), function (layerType) {
                aVectorLayerModels = aVectorLayerModels.concat(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: layerType}));
            }, this);

            aFilteredModels = _.union(aVectorLayerModels).filter(function (model) {
                return model.has("searchField") === true && model.get("searchField") !== "";
            });

            aFoundMatchingFeatures = this.findMatchingFeatures(aFilteredModels, sPrepSearchString);
            Radio.trigger("Searchbar", "pushHits", "hitList", aFoundMatchingFeatures);

            Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
            this.setInUse(false);
        }
    },

    /**
     * Checks if given feature is actually a clustered feature with content
     * @param {object} oFeature Feature to test as cluster
     * @returns {boolean} Flag if feature is a cluster
     */
    isClusteredFeature: function (oFeature) {
        return _.isArray(oFeature.get("features")) && oFeature.get("features").length > 0;
    },

    /**
     * Same as Feature.get() but if Feature is actually a cluster, it returns the value of the
     * first child feature found.
     * @param {object} oFeature The feature object to read the value from
     * @param {string} sProperty Property Key
     * @returns {mixed} Requested feature property value
     */
    getWithClusterFallback: function (oFeature, sProperty) {
        if (!this.isClusteredFeature(oFeature)) {
            return oFeature.get(sProperty);
        }
        return oFeature.get("features")[0].get(sProperty);
    },

    /**
     * Filters (clustered) features according to given search string.
     * @param {array} aFeatures Array of features to filter
     * @param {string} sSearchField Feature field key to look for value
     * @param {string} sSearchString Given string to search inside features
     * @returns {array} Array of features containing searched string
     */
    filterFeaturesArrayRec: function (aFeatures, sSearchField, sSearchString) {
        var aFilteredFeatures = [];

        aFilteredFeatures = aFeatures.filter(function (oFeature) {
            var aFilteredSubFeatures = [],
                sTestFieldValue;

            // if feature is clustered
            if (this.isClusteredFeature(oFeature)) {
                // enter recursion
                aFilteredSubFeatures = this.filterFeaturesArrayRec(oFeature.get("features"), sSearchField, sSearchString);

                // set sub features for this cluster
                if (aFilteredSubFeatures.length > 0) {
                    oFeature.set("features", aFilteredSubFeatures);
                    return true;
                }
                // filter this feature when no sub feature is left
                return false;
            }

            // if this key is not set, filter
            if (_.isUndefined(oFeature.get(sSearchField))) {
                return false;
            }

            sTestFieldValue = oFeature.get(sSearchField).toString().toUpperCase();
            // test if property value contains searched string as substring
            return sTestFieldValue.indexOf(sSearchString.toUpperCase()) !== -1;
        }, this);
        return aFilteredFeatures;
    },

    /**
     * Filters features of all models according to given search string. Searched Fields are
     * defined in config.
     * @param {array} models Array of models to pick features from
     * @param {string} searchString Given string to search inside features
     * @returns {array} Array of features containing searched string
     */
    findMatchingFeatures: function (models, searchString) {
        var aResultFeatures = [];

        _.each(models, function (model) {
            var aFeatures = model.get("layer").getSource().getFeatures(),
                aSearchFields = model.get("searchField"),
                filteredFeatures;

            if (_.isArray(aSearchFields) === false) {
                aSearchFields = [aSearchFields];
            }

            _.each(aSearchFields, function (sSearchField) {
                filteredFeatures = this.filterFeaturesArrayRec(aFeatures, sSearchField, searchString, []);
                aResultFeatures.push(this.getFeatureObject(sSearchField, filteredFeatures, model));
            }, this);
        }, this);

        return aResultFeatures;
    },

    /**
     * Gets a new feature object.
     * @param  {string} searchField Attribute feature has to be searche through
     * @param  {ol.Feature} filteredFeatures openlayers feature
     * @param  {Backbone.Model} model model of visibleVector
     * @return {array} array with feature objects
     */
    getFeatureObject: function (searchField, filteredFeatures, model) {
        var featureArray = [];

        _.each(filteredFeatures, function (feature) {
            var featureObject = {
                // "bezeichnung" hard coded? Or use searchField?
                name: this.getWithClusterFallback(feature, searchField),
                type: model.get("name"),
                coordinate: this.getCentroidPoint(feature.getGeometry()),
                imageSrc: this.getImageSource(feature, model),
                id: _.uniqueId(model.get("name")),
                layer_id: model.get("id"),
                additionalInfo: this.getAdditionalInfo(model, feature),
                feature: feature,
                gfiAttributes: model.get("gfiAttributes")
            };

            if (this.getGfiOnClick() === true) {
                featureObject.triggerEvent = {
                    channel: "VisibleVector",
                    event: "gfiOnClick"
                };
            }

            featureArray.push(featureObject);
        }, this);
        return featureArray;
    },

    /**
     * Gets centroid point for a openlayers geometry.
     * @param  {ol.geom.Geometry} geometry geometry to get centroid from
     * @return {ol.Coordinate} centroid coordinate
     */
    getCentroidPoint: function (geometry) {
        if (geometry.getType() === "MultiPolygon") {
            return geometry.getExtent();
        }

        return geometry.getCoordinates();

    },

    /**
     * Returns an image source of a feature style.
     * @param  {ol.Feature} feature openlayers feature
     * @param  {Backbone.Model} model model to get layer to get style from
     * @return {string} imagesource
     */
    getImageSource: function (feature, model) {
        var layerStyle,
            style;

        if (feature.getGeometry().getType() === "Point" || feature.getGeometry().getType() === "MultiPoint") {
            layerStyle = model.get("layer").getStyle(feature);

            // layerStyle returns style
            if (typeof layerStyle === "object") {
                return layerStyle[0].getImage().getSrc();
            }
            // layerStyle returns stylefunction

            style = layerStyle(feature);

            return style.getImage().getSrc();
        }

        return undefined;

    },

    /**
     * Get additional feature info.
     * @param {object} model model to get feature from
     * @param {object} feature feature to get info from
     * @returns {mixed} found additional info
     */
    getAdditionalInfo: function (model, feature) {
        var additionalInfo;

        if (!_.isUndefined(model.get("additionalInfoField"))) {
            additionalInfo = this.getWithClusterFallback(feature, model.get("additionalInfoField"));
        }

        return additionalInfo;
    },

    /**
     * Setter for minChars property
     * @param {mixed} value todo
     * @returns {void}
     */
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    /**
     * Setter for layerTypes property
     * @param {mixed} value todo
     * @returns {void}
     */
    setLayerTypes: function (value) {
        this.set("layerTypes", value);
    },

    /**
     * Getter for layerTypes property
     * @returns {mixed} todo
     */
    getLayerTypes: function () {
        return this.get("layerTypes");
    },

    /**
     * Setter for gfiOnClick property
     * @param {boolean} value todo
     * @returns {void}
     */
    setGfiOnClick: function (value) {
        this.set("gfiOnClick", value);
    },

    /**
     * Getter for gfiOnClick property
     * @returns {boolean} todo
     */
    getGfiOnClick: function () {
        return this.get("gfiOnClick");
    },

    /**
     * Setter for inUse property
     * @param {boolean} value todo
     * @returns {void}
     */
    setInUse: function (value) {
        this.set("inUse", value);
    }
});

export default VisibleVectorModel;
