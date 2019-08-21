import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import {WFS} from "ol/format.js";

const WFSLayer = Layer.extend(/** @lends WFSLayer.prototype */{
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        showSettings: true,
        isClustered: false,
        allowedVersions: ["1.1.0"]
    }),
    /**
     * @class WFSLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} supported=["2D", "3D"] Supported map modes.
     * @property {Boolean} showSettings=true Flag if settings selectable.
     * @property {Boolean} isClustered=false Flag if layer is clustered.
     */
    initialize: function () {

        this.checkForScale(Radio.request("MapView", "getOptions"));

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        if (this.has("clusterDistance")) {
            this.set("isClustered", true);
        }
    },

    /**
     * Creates layer source for wfs-layer.
     * @return {void}
     */
    createLayerSource: function () {
        const allowedVersions = this.get("allowedVersions"),
            isVersionValid = this.checkVersion(this.get("name"), this.get("id"), this.get("version"), allowedVersions);

        if (!isVersionValid) {
            this.set("version", allowedVersions[0]);
        }

        this.setLayerSource(new VectorSource());
        if (this.has("clusterDistance")) {
            this.createClusterLayerSource();
        }
    },

    /**
     * Checks the version of the wfs, since openlayers only accepts version 1.1.0.
     * @param {String} name name from layer
     * @param {String} id id from layer
     * @param {String} version version from wfs
     * @param {String[]} allowedVersions contains the allowed versions
     * @return {Boolean} is version valid
     */
    checkVersion: function (name, id, version, allowedVersions) {
        let isVersionValid = true;

        if (!allowedVersions.includes(version)) {
            isVersionValid = false;

            console.error("An attempt is made to load WFS-Layer: \"" + name + "\" with version: \"" + allowedVersions[0] + "\"!"
                + " Please use for wfs only the versions: " + allowedVersions + ", because only these are accepted by openlayers!");
        }
        return isVersionValid;
    },

    /**
     * Creates cluster layer source.
     * @return {void}
     */
    createClusterLayerSource: function () {
        this.setClusterLayerSource(new Cluster({
            source: this.get("layerSource"),
            distance: this.get("clusterDistance")
        }));
    },

    /**
     * Creates vector layer.
     * @return {void}
     */
    createLayer: function () {
        this.setLayer(new VectorLayer({
            source: this.has("clusterDistance") ? this.get("clusterLayerSource") : this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            gfiAttributes: this.get("gfiAttributes"),
            routable: this.get("routable"),
            gfiTheme: this.get("gfiTheme"),
            id: this.get("id"),
            hitTolerance: this.get("hitTolerance"),
            altitudeMode: "clampToGround"
        }));

        this.updateSource(true);
    },

    /**
     * Creates new WFS-Format.
     * @returns {ol.format.wfs} - WFS format.
     */
    getWfsFormat: function () {
        return new WFS({
            featureNS: this.get("featureNS"),
            featureType: this.get("featureType")
        });
    },

    /**
     * Updates layer source
     * @param  {Boolean} [showLoader] Flag if Loader should be shown.
     * @returns {void}
     */
    updateSource: function (showLoader) {
        var params = {
            REQUEST: "GetFeature",
            SERVICE: "WFS",
            SRSNAME: Radio.request("MapView", "getProjection").getCode(),
            TYPENAME: this.get("featureType"),
            VERSION: this.get("version")
        };

        $.ajax({
            beforeSend: function () {
                if (showLoader) {
                    Radio.trigger("Util", "showLoader");
                }
            },
            url: Radio.request("Util", "getProxyURL", this.get("url")),
            data: params,
            async: true,
            type: "GET",
            context: this,
            success: this.handleResponse,
            complete: function () {
                if (showLoader) {
                    Radio.trigger("Util", "hideLoader");
                }
            }
        });
    },

    /**
     * Handles response after new data is loaded.
     * @param  {xml} data Response from Ajax-Request.
     * @returns {void}
     */
    handleResponse: function (data) {
        var features = this.getFeaturesFromData(data);

        this.get("layerSource").clear(true);
        this.get("layerSource").addFeatures(features);
        this.styling();
        this.featuresLoaded(features);
    },

    /**
     * Parses xml data to openlayer features.
     * @param  {xml} data XML response.
     * @return {ol.feature[]} Array aus ol/Feature.
     */
    getFeaturesFromData: function (data) {
        var wfsReader,
            features;

        wfsReader = new WFS({
            featureNS: this.get("featureNS")
        });
        features = wfsReader.readFeatures(data);

        // Nur die Features verwenden, die eine Geometrie haben. Aufgefallen bei KITAs am 05.01.2018 (JW)
        features = features.filter(function (feature) {
            return !_.isUndefined(feature.getGeometry());
        });

        return features;
    },

    /**
     * Sets Style for layer.
     * @returns {void}
     */
    styling: function () {
        const stylelistmodel = Radio.request("StyleList", "returnModelById", this.get("styleId"));
        let isClusterfeature;

        if (!_.isUndefined(stylelistmodel)) {
            this.setStyle(function (feature) {
                isClusterfeature = _.isObject(feature.get("features")) === true;

                return stylelistmodel.createStyle(feature, isClusterfeature);
            });
        }

        this.get("layer").setStyle(this.get("style"));
    },

    /**
     * Generates a legend url.
     * @returns {void}
     */
    createLegendURL: function () {
        var style;

        if (!_.isUndefined(this.get("legendURL")) && !this.get("legendURL").length) {
            style = Radio.request("StyleList", "returnModelById", this.get("styleId"));

            if (!_.isUndefined(style)) {
                this.setLegendURL([style.get("imagePath") + style.get("imageName")]);
            }
        }
    },

    /**
     * Hides all features by setting style= null for all features.
     * @returns {void}
     */
    hideAllFeatures: function () {
        var collection = this.get("layerSource").getFeatures();

        collection.forEach(function (feature) {
            feature.setStyle(function () {
                return null;
            });
        }, this);
    },

    /**
     * Shows all features by setting their style.
     * @returns {void}
     */
    showAllFeatures: function () {
        var collection = this.get("layerSource").getFeatures(),
            style;

        collection.forEach(function (feature) {
            style = this.getStyleAsFunction(this.get("style"));

            feature.setStyle(style(feature));
        }, this);
    },

    /**
     * Only shows features that match the given ids.
     * @param {string[]} featureIdList List of feature ids.
     * @returns {void}
     */
    showFeaturesByIds: function (featureIdList) {
        this.hideAllFeatures();
        _.each(featureIdList, function (id) {
            var feature = this.get("layerSource").getFeatureById(id),
                style = [];

            style = this.getStyleAsFunction(this.get("style"));

            feature.setStyle(style(feature));
        }, this);
    },

    /**
     * Returns the style as a function.
     * @param {Function|Object} style ol style object or style function.
     * @returns {function} - style as function.
     */
    getStyleAsFunction: function (style) {
        if (_.isFunction(style)) {
            return style;
        }

        return function () {
            return style;
        };

    },

    /**
     * Setter for attribute "style".
     * @param {ol.style} value openlayers style.
     * @returns {void}
     */
    setStyle: function (value) {
        this.set("style", value);
    },
    /**
     * Setter for attribute "clusterLayerSource".
     * @param {ol.source.vector} value vector source.
     * @returns {void}
     */
    setClusterLayerSource: function (value) {
        this.set("clusterLayerSource", value);
    },
    /**
     * Setter for attribute "projection".
     * @param {ol.projection} value projection.
     * @returns {void}
     */
    setProjection: function (value) {
        this.set("projection", value);
    }
});

export default WFSLayer;
