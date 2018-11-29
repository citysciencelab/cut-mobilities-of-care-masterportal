import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import {WFS} from "ol/format.js";

const WFSLayer = Layer.extend({
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
    },

    /**
     * Wird vom Model getriggert und erzeugt eine vectorSource.
     * Ggf. auch eine clusterSource
     * @return {[type]} [description]
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
     * @return {[type]} [description]
     */
    createClusterLayerSource: function () {
        this.setClusterLayerSource(new Cluster({
            source: this.get("layerSource"),
            distance: this.get("clusterDistance")
        }));
    },

    /**
     * [createLayer description]
     * @return {[type]} [description]
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

        this.updateSource(true);
    },

    /**
     * [setClusterLayerSource description]
     * @param {[type]} value [description]
     * @returns {void}
     */
    setClusterLayerSource: function (value) {
        this.set("clusterLayerSource", value);
    },

    getWfsFormat: function () {
        return new WFS({
            featureNS: this.get("featureNS"),
            featureType: this.get("featureType")
        });
    },

    /**
     * Lädt den WFS neu
     * @param  {boolean} [showLoader=false] Zeigt einen Loader während der Request läuft
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
     * Anstoßen der notwendigen Schritte nachdem neue Daten geladen wurden.
     * @param  {xml} data Response des Ajax-Requests
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
     * Erzeugt aus einer XML-Response eine ol.features Collection
     * @param  {xml} data die XML-Response
     * @return {ol/Feature[]}   Collection aus ol/Feature
     */
    getFeaturesFromData: function (data) {
        var wfsReader,
            features;

        wfsReader = new WFS({
            featureNS: this.get("featureNS")
        });
        features = wfsReader.readFeatures(data);

        // Nur die Features verwenden, die eine Geometrie haben. Aufgefallen bei KITAs am 05.01.2018 (JW)
        features = _.filter(features, function (feature) {
            return !_.isUndefined(feature.getGeometry());
        });

        return features;
    },

    styling: function () {
        var stylelistmodel = Radio.request("StyleList", "returnModelById", this.get("styleId"));

        if (!_.isUndefined(stylelistmodel)) {
            /**
             * function that takes a feature and resolution and returns an array of styles
             * Erfordert beide Parameter, sonst Laufzeitfehler (in ol <= 4.6.5)
             * @param  {[ol.feature]} feature
             * @param  {number} resolution
             * @return {[ol.style.Style]}
             * @tutorial https://openlayers.org/en/latest/apidoc/ol.html#.StyleFunction
             */
            this.setStyle(function (feature) {
                return stylelistmodel.createStyle(feature, this.get("isClustered"));
            }.bind(this));
        }

        this.get("layer").setStyle(this.get("style"));
    },

    setProjection: function (proj) {
        this.set("projection", proj);
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
     * sets null style (= no style) for all features
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

    showAllFeatures: function () {
        var collection = this.get("layerSource").getFeatures(),
            style;

        collection.forEach(function (feature) {
            style = this.getStyleAsFunction(this.get("style"));

            feature.setStyle(style(feature));
        }, this);
    },
    /**
     * Zeigt nur die Features an, deren Id übergeben wird
     * @param  {string[]} featureIdList - featureIdList
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

    getStyleAsFunction: function (style) {
        if (_.isFunction(style)) {
            return style;
        }

        return function () {
            return style;
        };

    },

    /**
    * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
    * @param {object} options -
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

    // setter for style
    setStyle: function (value) {
        this.set("style", value);
    }
});

export default WFSLayer;
