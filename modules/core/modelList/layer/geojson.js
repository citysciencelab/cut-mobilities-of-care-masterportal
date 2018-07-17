define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        $ = require("jquery"),
        ol = require("openlayers"),
        GeoJSONLayer;

    GeoJSONLayer = Layer.extend({
        initialize: function () {
            this.superInitialize();
            this.toggleAutoReload();
            this.listenTo(this, {
                "change:isVisibleInMap": function () {
                    this.toggleAutoReload();
                }
            });
            this.setStyleId(this.get("styleId") || this.get("id"));
            this.setStyleFunction(Radio.request("StyleList", "returnModelById", this.get("styleId")));
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
                source: this.get("layerSource"),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.get("id")
            }));
            if (_.isUndefined(this.get("geojson"))) {
                this.updateData();
            }
            else {
                this.handleData(this.get("geojson"), Radio.request("MapView", "getProjection").getCode());
            }
        },
        updateData: function (showLoader) {
            var params = {
                request: "GetFeature",
                service: "WFS",
                typeName: this.get("featureType"),
                outputFormat: "application/geo+json",
                version: this.get("version")
            };

            if (!_.isUndefined(showLoader) && showLoader === true) {
                Radio.trigger("Util", "showLoader");
            }

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url")),
                data: params,
                async: true,
                type: "GET",
                context: this,
                success: function (data) {
                    Radio.trigger("Util", "hideLoader");
                    this.handleData(data, Radio.request("MapView", "getProjection").getCode());
                },
                error: function () {
                    Radio.trigger("Util", "hideLoader");
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
         * @param  {Backbone.Model} stylelistmodel Model für Styles
         * @returns {undefined}
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
            var style;

            if (_.isUndefined(this.get("legendURL")) === false && this.get("legendURL").length !== 0) {
                style = Radio.request("StyleList", "returnModelById", this.get("styleId"));

                if (_.isUndefined(style) === false) {
                    this.set("legendURL", [style.get("imagePath") + style.get("imageName")]);
                }
            }
        },
        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList Liste der FeatureIds
         * @return {undefined}
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
         * @return {undefined}
         */
        hideAllFeatures: function () {
            var collection = this.get("layerSource").getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(function () {
                    return null;
                });
            }, this);
        },

        toggleAutoReload: function () {
            if (this.has("autoRefresh") && _.isNumber(this.attributes.autoRefresh) && this.attributes.autoRefresh > 500) {
                if (this.get("isVisibleInMap") === true) {
                    this.interval = setInterval(function (my) {
                        my.updateData(false);
                    }, this.attributes.autoRefresh, this);
                }
                else {
                    clearInterval(this.interval);
                }
            }
        },

        /**
         * sets style for all features
         * @return {undefined}
         */
        showAllFeatures: function () {
            var collection = this.get("layerSource").getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(undefined);
            }, this);
        },

        setStyleId: function (value) {
            this.set("styleId", value);
        },

        // setter for style
        setStyle: function (value) {
            this.set("style", value);

        }
    });

    return GeoJSONLayer;
});
