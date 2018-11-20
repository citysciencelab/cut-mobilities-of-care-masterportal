import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import {GeoJSON} from "ol/format.js";

const GeoJSONLayer = Layer.extend({
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        showSettings: true,
        isClustered: false
    }),

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
     * [createLayerSource description]
     * Wird vom Model getriggert und erzeugt eine vectorSource.
     * Ggf. auch eine clusterSource
     * @return {void}
     * @uses this createClusterLayerSource
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
        if (this.has("clusterDistance")) {
            this.createClusterLayerSource();
        }
    },
    /**
     * [createClusterLayerSource description]
     * @return {void}
     */
    createClusterLayerSource: function () {
        this.setClusterLayerSource(new Cluster({
            source: this.get("layerSource"),
            distance: this.get("clusterDistance")
        }));
    },
    /**
     * [createLayer description]
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
            altitudeMode: "clampToGround"
        }));
        if (_.isUndefined(this.get("geojson"))) {
            this.updateSource();
        }
        else {
            this.handleData(this.get("geojson"), Radio.request("MapView", "getProjection").getCode());
        }
    },
    /**
     * [setClusterLayerSource description]
     * @param {ol.source.vector} value [description]
     * @returns {void}
     */
    setClusterLayerSource: function (value) {
        this.set("clusterLayerSource", value);
    },
    /**
     * Lädt das GeoJSON neu
     * @param  {boolean} [showLoader=false] Zeigt einen Loader während der Request läuft
     * @returns {void}
     */
    updateSource: function (showLoader) {
        var params = {
            request: "GetFeature",
            service: "WFS",
            typeName: this.get("featureType"),
            outputFormat: "application/geo+json",
            version: this.get("version")
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
            success: function (data) {
                this.handleData(data, Radio.request("MapView", "getProjection").getCode());
            },
            complete: function () {
                if (showLoader) {
                    Radio.trigger("Util", "hideLoader");
                }
            }
        });
    },
    handleData: function (data, mapCrs) {
        var jsonCrs = _.has(data, "crs") && data.crs.properties.name ? data.crs.properties.name : "EPSG:4326",
            features = this.parseDataToFeatures(data),
            newFeatures = [];

        if (jsonCrs !== mapCrs) {
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

    parseDataToFeatures: function (data) {
        var geojsonReader = new GeoJSON();

        return geojsonReader.readFeatures(data);
    },

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
            });
        }
    },

    // wird in layerinformation benötigt. --> macht vlt. auch für Legende Sinn?!
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
     * Zeigt nur die Features an, deren Id übergeben wird
     * @param  {string[]} featureIdList Liste der FeatureIds
     * @return {void}
     */
    showFeaturesByIds: function (featureIdList) {
        this.hideAllFeatures();
        _.each(featureIdList, function (id) {
            var feature = this.get("layerSource").getFeatureById(id);

            feature.setStyle(undefined);
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
     * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
     * @param {object} options -
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
     * sets style for all features
     * @return {void}
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
