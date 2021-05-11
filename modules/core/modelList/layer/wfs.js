import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import {WFS} from "ol/format.js";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

const WFSLayer = Layer.extend(/** @lends WFSLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        showSettings: true,
        isSecured: false,
        isClustered: false,
        allowedVersions: ["1.1.0"],
        altitudeMode: "clampToGround",
        useProxy: false
    }),
    /**
     * @class WFSLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} supported=["2D", "3D"] Supported map modes.
     * @property {Boolean} showSettings=true Flag if settings selectable.
     * @property {Boolean} isClustered=false Flag if layer is clustered.
     * @property {String[]} allowedVersions=["1.1.0"] Allowed Version of WFS requests.
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @fires Layer#RadioTriggerVectorLayerResetFeatures
     * @listens Layer#RadioRequestVectorLayerGetFeatures
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

            console.warn(`The WFS layer: "${name}" is configured in version: ${version}.`
             + ` OpenLayers accepts WFS only in the versions: ${allowedVersions},`
             + ` It tries to load the layer: "${name}" in version ${allowedVersions[0]}!`);
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
            distance: this.get("clusterDistance"),
            geometryFunction: function (feature) {
                // do not cluster invisible features; can't rely on style since it will be null initially
                if (feature.get("hideInClustering") === true) {
                    return null;
                }
                return feature.getGeometry();
            }
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
            gfiTheme: this.get("gfiTheme"),
            id: this.get("id"),
            hitTolerance: this.get("hitTolerance"),
            altitudeMode: this.get("altitudeMode"),
            alwaysOnTop: this.get("alwaysOnTop")
        }));

        if (this.get("isSelected")) {
            this.updateSource(true);
        }
        this.createLegend();
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
     * Returns the params and options to request an update of the layer source.
     * @returns {object} contains params, url and xhrFields for the request
     */
    getRequestParamsAndOptions: function () {
        let propertyname = "";

        if (Array.isArray(this.get("propertyNames"))) {
            propertyname = this.get("propertyNames").join(",");
        }

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url"),
            prefix = this.get("featurePrefix"),
            namespace = this.get("featureNS"),
            typename = this.get("featureType"),
            params = {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                SRSNAME: Radio.request("MapView", "getProjection")?.getCode(),
                TYPENAME: typename,
                VERSION: this.get("version"),
                PROPERTYNAME: propertyname ? propertyname : "",
                // loads only the features in the extent of this geometry
                BBOX: this.get("bboxGeometry") ? this.get("bboxGeometry").getExtent().toString() : undefined
            },
            xhrParameters = this.attributes.isSecured ? {withCredentials: true} : null;


        if (prefix !== undefined && typeof prefix === "string" && namespace !== undefined && typeof namespace === "string") {
            params.NAMESPACE = `xmlns(${prefix}=${namespace})`;
            if (typename && typename.indexOf(`${prefix}:`) !== 0) {
                params.TYPENAME = `${prefix}:${typename}`;
            }
        }
        return {
            url: url,
            params: params,
            xhrParameters: xhrParameters
        };
    },

    /**
     * Updates layer source.
     * @param {boolean} showLoader Flag if Loader should be shown.
     * @param {object} requestParams contains params, url and xhrFields for the request
     * @returns {void}
     */
    updateSource: function (showLoader) {
        const requestParams = this.getRequestParamsAndOptions();

        $.ajax({
            beforeSend: function () {
                if (Radio.request("Map", "getInitialLoading") === 0 && showLoader) {
                    Radio.trigger("Util", "showLoader");
                }
            },
            url: requestParams.url,
            data: requestParams.params,
            async: true,
            type: "GET",
            context: this,
            xhrFields: requestParams.xhrParameters,
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
        let features = this.getFeaturesFromData(data);

        features = this.getFeaturesIntersectsGeometry(this.get("bboxGeometry"), features);
        this.get("layerSource").clear(true);
        this.get("layerSource").addFeatures(features);
        this.styling();
        this.prepareFeaturesFor3D(features);
        this.featuresLoaded(features);
    },

    /**
     * returns the features that intersect the given geometries
     * @param {ol.geom.Geometry[]} geometries - GeometryCollection with one or more geometry
     * @param {ol.Feature[]} features - all features in the geometry extent
     * @returns {ol.Feature[]} filtered features
     */
    getFeaturesIntersectsGeometry: function (geometries, features) {
        if (geometries) {
            return features.filter(function (feature) {
                // test if the geometry and the passed extent intersect
                return geometries.intersectsExtent(feature.getGeometry().getExtent());
            });
        }

        return features;
    },

    /**
     * Parses xml data to openlayer features.
     * @param  {xml} data XML response.
     * @return {ol.feature[]} Array aus ol/Feature.
     */
    getFeaturesFromData: function (data) {
        let features;
        const wfsReader = new WFS({
            featureNS: this.get("featureNS")
        });

        features = wfsReader.readFeatures(data);

        // Nur die Features verwenden, die eine Geometrie haben. Aufgefallen bei KITAs am 05.01.2018 (JW)
        features = features.filter(function (feature) {
            return feature.getGeometry() !== undefined;
        });

        return features;
    },

    /**
     * Sets Style for layer.
     * @returns {void}
     */
    styling: function () {
        const styleId = this.get("styleId"),
            styleModel = Radio.request("StyleList", "returnModelById", styleId);
        let isClusterFeature = false;

        if (styleModel !== undefined) {
            this.setStyle(function (feature) {
                // in manchen Fällen war feature undefined und in "this" geschrieben.
                // konnte nicht nachvollziehen, wann das so ist.
                const feat = feature !== undefined ? feature : this;

                isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features"));

                return styleModel.createStyle(feat, isClusterFeature);
            });
        }
        else {
            console.error(i18next.t("common:modules.core.modelList.layer.wrongStyleId", {styleId}));
        }

        this.get("layer").setStyle(this.get("style"));
    },

    /**
     * Creates the legend
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    createLegend: function () {
        const styleModel = Radio.request("StyleList", "returnModelById", this.get("styleId")),
            isSecured = this.attributes.isSecured;
        let legend = this.get("legend");

        /**
         * @deprecated in 3.0.0
         */
        if (this.get("legendURL")) {
            if (this.get("legendURL") === "") {
                legend = true;
            }
            else if (this.get("legendURL") === "ignore") {
                legend = false;
            }
            else {
                legend = this.get("legendURL");
            }
        }

        if (Array.isArray(legend)) {
            this.setLegend(legend);
        }
        else if (styleModel && legend === true) {
            if (!isSecured) {
                styleModel.getGeometryTypeFromWFS(this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"));
            }
            else if (isSecured) {
                styleModel.getGeometryTypeFromSecuredWFS(this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"));
            }
            this.setLegend(styleModel.getLegendInfos());
        }
        else if (typeof legend === "string") {
            this.setLegend([legend]);
        }
    },

    /**
     * Hides all features by setting style= null for all features.
     * @returns {void}
     */
    hideAllFeatures: function () {
        const layerSource = this.get("layerSource"),
            features = this.get("layerSource").getFeatures();

        // optimization - clear and re-add to prevent cluster updates on each change
        layerSource.clear();

        features.forEach(function (feature) {
            feature.set("hideInClustering", true);
            feature.setStyle(function () {
                return null;
            });
        }, this);

        layerSource.addFeatures(features);
    },

    /**
     * Shows all features by setting their style.
     * @returns {void}
     */
    showAllFeatures: function () {
        const collection = this.get("layerSource").getFeatures();
        let style;

        collection.forEach(function (feature) {
            style = this.getStyleAsFunction(this.get("style"));

            feature.setStyle(style(feature));
        }, this);
    },

    /**
     * Only shows features that match the given ids.
     * @param {String[]} featureIdList List of feature ids.
     * @fires Layer#RadioTriggerVectorLayerResetFeatures
     * @returns {void}
     */
    showFeaturesByIds: function (featureIdList) {
        const layerSource = this.get("layerSource"),
            // featuresToShow is a subset of allLayerFeatures
            allLayerFeatures = layerSource.getFeatures(),
            featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

        this.hideAllFeatures();

        // optimization - clear and re-add to prevent cluster updates on each change
        layerSource.clear();

        featuresToShow.forEach(feature => {
            const style = this.getStyleAsFunction(this.get("style"));

            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }, this);

        layerSource.addFeatures(allLayerFeatures);
        Radio.trigger("VectorLayer", "resetFeatures", this.get("id"), allLayerFeatures);
    },

    /**
     * Returns the style as a function.
     * @param {Function|Object} style ol style object or style function.
     * @returns {function} - style as function.
     */
    getStyleAsFunction: function (style) {
        if (typeof style === "function") {
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
