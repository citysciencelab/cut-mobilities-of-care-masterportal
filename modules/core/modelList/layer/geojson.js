import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import {GeoJSON} from "ol/format.js";

const GeoJSONLayer = Layer.extend(/** @lends GeoJSONLayer.prototype */{
    /**
     * @class Class representing a GeoJSONLayer
     * @description Module to represent GeoJSONLayer
     * @extends Layer
     * @constructs
     * @inheritdoc
     * @memberOf Core.ModelList.Layer
     * @property {String[]} [supported="2D,3D"] Supported modes "2D" and / or "3D"
     * @property {number} [clusterDistance="undefined"] Distance to group features to clusters
     * @property {string} [styleId="ol default"] ID of style in style.json
     * @fires StyleList#RadioRequestReturnModelById
     * @fires MapView#RadioRequestGetProjection
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @fires Util#RadioTriggerUtilHideLoader
     * @fires RemoteInterface#RadioTriggerPostMessage
     */
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        isClustered: false
    }),

    /**
     * @fires StyleList#RadioRequestReturnModelById
     * @returns {void}
     */
    initialize: function () {
        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        if (this.has("clusterDistance")) {
            this.set("isClustered", true);
        }

        this.setStyleId(this.get("styleId") || this.get("id"));
        this.setStyleFunction(Radio.request("StyleList", "returnModelById", this.get("styleId")));
    },

    /**
     * Triggert by Layer to create a layerSource respectively a clusterLayerSource
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
        if (this.has("clusterDistance")) {
            this.createClusterLayerSource();
        }
    },

    /**
     * Triggert by createLayerSource to create a clusterLayerSource
     * @returns {void}
     */
    createClusterLayerSource: function () {
        this.setClusterLayerSource(new Cluster({
            source: this.get("layerSource"),
            distance: this.get("clusterDistance")
        }));
    },

    /**
     * Triggert by Layer to create a ol/layer/Vector
     * @fires MapView#RadioRequestGetProjection
     * @returns {void}
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
            altitudeMode: "clampToGround",
            hitTolerance: this.get("hitTolerance")
        }));

        if (_.isUndefined(this.get("geojson"))) {
            this.updateSource();
        }
        else {
            this.handleData(this.get("geojson"), Radio.request("MapView", "getProjection").getCode());
        }
    },

    /**
     * Setter for clusterLayerSource
     * @param {ol.source.vector} value clusterLayerSource
     * @returns {void}
     */
    setClusterLayerSource: function (value) {
        this.set("clusterLayerSource", value);
    },

    /**
     * Sends GET request with or without wfs parameter according to typ
     * @param  {boolean} [showLoader=false] shows loader div
     * @returns {void}
     */
    updateSource: function (showLoader) {
        const typ = this.get("typ"),
            url = Radio.request("Util", "getProxyURL", this.get("url")),
            xhr = new XMLHttpRequest(),
            that = this;

        let paramUrl;

        if (typ === "WFS") {
            paramUrl = url + "?REQUEST=GetFeature&SERVICE=WFS&TYPENAME=" + this.get("featureType") + "&OUTPUTFORMAT=application/geo+json&VERSION=" + this.get("version");
        }
        else if (typ === "GeoJSON") {
            paramUrl = url;
        }

        if (showLoader) {
            Radio.trigger("Util", "showLoader");
        }

        xhr.open("GET", paramUrl, true);
        xhr.timeout = 10000;
        xhr.onload = function (event) {
            that.handleResponse(event.currentTarget.responseText, xhr.status, showLoader);
        };
        xhr.ontimeout = function () {
            that.handleResponse({}, "timeout", showLoader);
        };
        xhr.onabort = function () {
            that.handleResponse({}, "abort", showLoader);
        };
        xhr.send();
    },

    /**
     * Handles the xhr response
     * @fires MapView#RadioRequestGetProjection
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @fires Util#RadioTriggerUtilHideLoader
     * @param {string} responseText response as GeoJson
     * @param {integer|string} status status of xhr-request
     * @param {boolean} [showLoader=false] Flag to show Loader
     * @returns {void}
     */
    handleResponse: function (responseText, status, showLoader) {
        if (status === 200) {
            this.handleData(responseText, Radio.request("MapView", "getProjection").getCode());
        }
        else {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status + ")");
        }

        if (showLoader) {
            Radio.trigger("Util", "hideLoader");
        }
    },

    /**
     * Takes the response, parses the geojson and creates ol.features.
     * According to the GeoJSON Specification (RFC 7946) the geometry is expected to be in EPSG:4326.
     * @fires RemoteInterface#RadioTriggerPostMessage
     * @param   {string} data   response as GeoJson
     * @param   {string} mapCrs EPSG-Code of ol.map
     * @returns {void}
     */
    handleData: function (data, mapCrs) {
        var jsonCrs = "EPSG:4326",
            features = this.parseDataToFeatures(data),
            newFeatures = [];

        if (!features) {
            return;
        }
        else if (jsonCrs !== mapCrs) {
            features = this.transformFeatures(features, jsonCrs, mapCrs);
        }

        features.forEach(function (feature) {
            var id = feature.get("id") || _.uniqueId();

            feature.setId(id);
        });
        this.get("layerSource").clear(true);
        this.get("layerSource").addFeatures(features);
        this.get("layer").setStyle(this.get("styleFunction"));

        // für it-gbm
        if (!this.has("autoRefresh")) {
            features.forEach(function (feature) {
                feature.set("extent", feature.getGeometry().getExtent());
                newFeatures.push(_.omit(feature.getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]));
            });
            Radio.trigger("RemoteInterface", "postMessage", {"allFeatures": JSON.stringify(newFeatures), "layerId": this.get("id")});
        }

        this.featuresLoaded(features);
    },

    /**
     * Tries to parse data string to ol.format.GeoJson
     * @param   {string} data string to parse
     * @throws Will throw an error if the argument cannot be parsed.
     * @returns {object}    ol/format/GeoJSON/features
     */
    parseDataToFeatures: function (data) {
        const geojsonReader = new GeoJSON();
        let jsonObjects;

        try {
            jsonObjects = geojsonReader.readFeatures(data);
        }
        catch (err) {
            console.error("GeoJSON cannot be parsed.");
        }

        return jsonObjects;
    },

    /**
     * Transforms features between CRS
     * @param   {feature[]} features Array of ol.features
     * @param   {string}    crs      EPSG-Code of feature
     * @param   {string}    mapCrs   EPSG-Code of ol.map
     * @returns {void}
     */
    transformFeatures: function (features, crs, mapCrs) {
        _.each(features, function (feature) {
            var geometry = feature.getGeometry();

            geometry.transform(crs, mapCrs);
        });
        return features;
    },

    /**
     * sets style function for features or layer
     * @param  {Backbone.Model} stylelistmodel Model für Styles
     * @returns {void}
     */
    setStyleFunction: function (stylelistmodel) {
        if (_.isUndefined(stylelistmodel)) {
            this.set("styleFunction", undefined);
        }
        else {
            this.set("styleFunction", function (feature) {
                return stylelistmodel.createStyle(feature, this.get("isClustered"));
            }.bind(this));
        }
    },

    /**
     * creates the legendUrl used by layerinformation
     * @fires StyleList#RadioRequestReturnModelById
     * @returns {void}
     */
    createLegendURL: function () {
        let style;

        if (!_.isUndefined(this.get("legendURL")) && !this.get("legendURL").length) {
            style = Radio.request("StyleList", "returnModelById", this.get("styleId"));

            if (!_.isUndefined(style)) {
                this.setLegendURL([style.get("imagePath") + style.get("imageName")]);
            }
        }
    },

    /**
     * Filters the visibility of features by ids
     * @param  {string[]} featureIdList Liste der FeatureIds
     * @return {void}
     */
    showFeaturesByIds: function (featureIdList) {
        this.hideAllFeatures();
        _.each(featureIdList, function (id) {
            var feature = this.get("layerSource").getFeatureById(id);

            if (feature !== null) {
                feature.setStyle(undefined);
            }

        }, this);
    },

    /**
     * sets null style (=no style) for all features
     * @return {void}
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
     * Sets inside or outside of scale range
     * @param {object} options scale options
     * @returns {void}
     */
    checkForScale: function (options) {
        if (parseFloat(options.scale, 10) <= this.get("maxScale") && parseFloat(options.scale, 10) >= this.get("minScale")) {
            this.setIsOutOfRange(false);
        }
        else {
            this.setIsOutOfRange(true);
        }
    },

    /**
     * sets undefined style for all features so the layer style will be used
     * @returns {void}
     */
    showAllFeatures: function () {
        var collection = this.get("layerSource").getFeatures();

        collection.forEach(function (feature) {
            feature.setStyle(undefined);
        }, this);
    },

    // setter for styleId
    setStyleId: function (value) {
        this.set("styleId", value);
    },

    // setter for style
    setStyle: function (value) {
        this.set("style", value);
    },

    // setter for legendURL
    setLegendURL: function (value) {
        this.set("legendURL", value);
    }
});

export default GeoJSONLayer;
