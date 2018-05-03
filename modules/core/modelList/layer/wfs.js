define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        WFSLayer;

    WFSLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
        },

        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        /**
         * [createClusterLayerSource description]
         * @return {[type]} [description]
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.getLayerSource(),
                distance: this.getClusterDistance()
            }));
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.has("clusterDistance") ? this.getClusterLayerSource() : this.getLayerSource(),
                name: this.getName(),
                typ: this.getTyp(),
                gfiAttributes: this.getGfiAttributes(),
                routable: this.getRoutable(),
                gfiTheme: this.getGfiTheme(),
                id: this.getId()
            }));

            this.updateData();
        },

        /**
         * [setClusterLayerSource description]
         * @param {[type]} value [description]
         */
        setClusterLayerSource: function (value) {
            this.set("clusterLayerSource", value);
        },

        /**
         * [getClusterLayerSource description]
         * @return {[type]}       [description]
         */
        getClusterLayerSource: function () {
            return this.get("clusterLayerSource");
        },

        getWfsFormat: function () {
            return new ol.format.WFS({
                featureNS: this.getFeatureNS(),
                featureType: this.getFeatureType()
            });
        },

        updateData: function () {
            var params = {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                SRSNAME: Radio.request("MapView", "getProjection").getCode(),
                TYPENAME: this.getFeatureType(),
                VERSION: this.getVersion()
            };

            Radio.trigger("Util", "showLoader");

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url")),
                data: params,
                async: true,
                type: "GET",
                context: this,
                success: function (data) {
                    Radio.trigger("Util", "hideLoader");
                    var wfsReader = new ol.format.WFS({
                            featureNS: this.getFeatureNS()
                        }),
                        features = wfsReader.readFeatures(data),
                        isClustered = this.has("clusterDistance") ? true : false;

                    // nur die Features verwenden die eine geometrie haben aufgefallen bei KITAs am 05.01.2018 (JW)
                    features = _.filter(features, function (feature) {
                        return !_.isUndefined(feature.getGeometry());
                    });
                    this.getLayerSource().addFeatures(features);
                    this.set("loadend", "ready");
                    Radio.trigger("WFSLayer", "featuresLoaded", this.getId(), features);
                    this.styling(isClustered);
                    this.getLayer().setStyle(this.getStyle());
                    this.featuresLoaded(features);
                },
                error: function () {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },
        styling: function (isClustered) {
            var stylelistmodel = Radio.request("StyleList", "returnModelById", this.getStyleId());

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
                    return stylelistmodel.createStyle(feature, isClustered);
                });
            }
        },

        setProjection: function (proj) {
            this.set("projection", proj);
        },

        getStyleId: function () {
            return this.get("styleId");
        },

        // wird in layerinformation benötigt. --> macht vlt. auch für Legende Sinn?!
        createLegendURL: function () {
            if (!this.getLegendURL().length) {
                var style = Radio.request("StyleList", "returnModelById", this.getStyleId());

                if (!_.isUndefined(style)) {
                    this.setLegendURL([style.getImagePath() + style.getImageName()]);
                }
            }
        },
        /**
         * Versteckt alle Features mit dem Hidden-Style
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(this.getHiddenStyle());
            }, this);
        },
        showAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures(),
                style;

            collection.forEach(function (feature) {
                style = this.getStyleAsFunction(this.getStyle());

                feature.setStyle(style(feature));
            }, this);
        },
        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        showFeaturesByIds: function (featureIdList) {
            this.hideAllFeatures();
            _.each(featureIdList, function (id) {
                var feature = this.getLayerSource().getFeatureById(id),
                    style = [];

                style = this.getStyleAsFunction(this.getStyle());

                feature.setStyle(style(feature));
            }, this);
        },
        getStyleAsFunction: function (style) {
            if (_.isFunction(style)) {
                return style;
            }
            else {
                return function () {
                    return style;
                };
            }
        },
        getHiddenStyle: function () {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    fill: new ol.style.Fill({
                        color: "rgba(0, 0, 0, 0)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(0, 0, 0, 0)"
                    })
                })
            });
        },

        // getter for style
        getStyle: function () {
            return this.get("style");
        },
        // setter for style
        setStyle: function (value) {
            this.set("style", value);
        },

        // getter for clusterDistance
        getClusterDistance: function () {
            return this.get("clusterDistance");
        },

        // getter for featureNS
        getFeatureNS: function () {
            return this.get("featureNS");
        },
        // getter for featureType
        getFeatureType: function () {
            return this.get("featureType");
        }
    });

    return WFSLayer;
});
