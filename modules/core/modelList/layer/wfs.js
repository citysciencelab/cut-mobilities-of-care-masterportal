define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        WFSLayer;

    WFSLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
            var channel = Radio.channel("WFSLayer");
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
                distance: this.get("clusterDistance")
            }));
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.has("clusterDistance") ? this.getClusterLayerSource() : this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
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
                featureNS: this.get("featureNS"),
                featureType: this.get("featureType")
            });
        },

        updateData: function () {
            var params = {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                SRSNAME: Radio.request("MapView", "getProjection").getCode(),
                TYPENAME: this.get("featureType"),
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
                            featureNS: this.get("featureNS")
                        }),
                        features = wfsReader.readFeatures(data),
                        isClustered = this.has("clusterDistance") ? true : false;

                    this.getLayerSource().addFeatures(features);
                    this.set("loadend", "ready");
                    Radio.trigger("WFSLayer", "featuresLoaded", this.getId(), features);
                    this.styling(isClustered);
                    this.getLayer().setStyle(this.getStyle());
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },
        styling: function (isClustered) {
            var stylelistmodel = Radio.request("StyleList", "returnModelById", this.getStyleId());

            this.setStyle(function(feature) {
                return stylelistmodel.createStyle(feature, isClustered);
            });
        },
        /*
        * Wenn MapView Option verändert werden: bei neuem Maßstab
        */
        optionsChanged: function () {
            var isResolutionInRange = this.isResolutionInRange(),
                visibility = this.get("visibility");

            if (visibility === true && isResolutionInRange === true) {
                this.get("layer").setVisible(true);
            }
            else {
                this.get("layer").setVisible(false);
            }
            this.set("isResolutionInRange", isResolutionInRange);
        },
        /*
        * Prüft, ob dieser Layer aktuell im sichtbaren Maßstabsbereich liegt und gibt true/false zurück
        */
        isResolutionInRange: function () {
            var layerMaxScale = parseFloat(this.get("maxScale")),
                layerMinScale = parseFloat(this.get("minScale")),
                mapOptions = Radio.request("MapView", "getOptions"),
                mapScale = parseFloat(mapOptions.scale);

            if (layerMaxScale && mapScale) {
                if (mapScale > layerMaxScale) {
                    return false;
                }
            }
            if (layerMinScale && mapScale) {
                if (mapScale < layerMinScale) {
                    return false;
                }
            }
            return true;
        },
        setVisibility: function () {
            var visibility = this.get("visibility"),
                isResolutionInRange = this.isResolutionInRange();

            this.set("isResolutionInRange", isResolutionInRange);
            if (visibility === true && isResolutionInRange === true) {
                if (this.get("layer").getSource().getFeatures().length === 0) {
                    this.updateData();
                    this.set("visibility", false, {silent: true});
                }
                else {
                    this.get("layer").setVisible(true);
                }
                this.toggleEventAttribution(true);
            }
            else {
                this.get("layer").setVisible(false);
                this.set("visibility", false, {silent: true});
                this.toggleEventAttribution(false);
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
            if (!this.get("legendURL").length) {
                var style = Radio.request("StyleList", "returnModelById", this.getStyleId());

                this.set("legendURL", [style.get("imagePath") + style.get("imageName")]);
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
                style = this.getStyleAsFunction(this.get("style"));

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

                style = this.getStyleAsFunction(this.get("style"));

                feature.setStyle(style(feature));
            }, this);
        },
        getStyleAsFunction: function (style) {
            if (_.isFunction(style)) {
                return style;
            }
            else {
                return function (feature) {
                    return style;
                }
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
        }
    });

    return WFSLayer;
});
