define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        GeoJSONLayer;

    GeoJSONLayer = Layer.extend({
        initialize: function () {
            this.setStyleFunction(Radio.request("StyleList", "returnModelById", this.get("styleId")));
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
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId()
            }));
            if (_.isUndefined(this.get("geojson"))) {
                this.updateData();
            }
            else {
                this.handleData(this.get("geojson"), Radio.request("MapView", "getProjection").getCode());
            }
        },
        updateData: function () {
            var params = {
                request: "GetFeature",
                service: "WFS",
                typeName: this.get("featureType"),
                outputFormat: "application/geo+json",
                maxFeatures: 100,
                version: this.getVersion()
            };

            Radio.trigger("Util", "showLoader");

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url")),
                data: params,
                async: false,
                type: "GET",
                context: this,
                success: function (data) {
                    this.handleData(data, Radio.request("MapView", "getProjection").getCode());
                },
                error: function () {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },
        handleData: function (data, mapCrs) {
             var jsonCrs = (_.has(data, "crs") && data.crs.properties.name) ? data.crs.properties.name : "EPSG:4326",
                features = this.parseDataToFeatures(data),
                isClustered;

            if (jsonCrs !== mapCrs) {
                features = this.transformFeatures(features, jsonCrs, mapCrs);
            }

            features.forEach(function (feature, index) {
                var id = feature.get("id") || _.uniqueId();

                feature.setId(id);
            });
            isClustered = this.has("clusterDistance") ? true : false;
            this.getLayerSource().addFeatures(features);
            this.getLayer().setStyle(this.get("styleFunction"));
            Radio.trigger("GeoJSONLayer", "featuresLoaded", this.getId(), features);
            Radio.trigger("Util", "hideLoader");
        },

        parseDataToFeatures: function (data) {
            var geojsonReader = new ol.format.GeoJSON();

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
         * @param  {Backbone.Model} stylelistmodel
         */
        setStyleFunction: function (stylelistmodel) {
             if (_.isUndefined(stylelistmodel)) {
                this.set("styleFunction", undefined);
            }
            else {
                this.set("styleFunction", function (feature) {
                    return stylelistmodel.createStyle(feature);
                });
            }
        },

        // Getter
        getFeatures: function () {
            return this.get("features");
        },


        // wird in layerinformation benötigt. --> macht vlt. auch für Legende Sinn?!
        createLegendURL: function () {
            if (!this.get("legendURL").length) {
                var style = Radio.request("StyleList", "returnModelById", this.getStyleId());

                if (!_.isUndefined(style)) {
                    this.set("legendURL", [style.get("imagePath") + style.get("imageName")]);
                }
            }
        },
        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        showFeaturesByIds: function (featureIdList) {
            this.hideAllFeatures();
            _.each(featureIdList, function (id) {
                var feature = this.getLayerSource().getFeatureById(id);

                feature.setStyle(undefined);
            }, this);
        },

        /**
         * sets null style (=no style) for all features
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(function () {
                    return null;
                });
            }, this);
        },

        /**
         * sets style for all features
         */
        showAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(undefined);
            }, this);
        },
        getStyleId: function () {
            return this.get("styleId");
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

    return GeoJSONLayer;
});
