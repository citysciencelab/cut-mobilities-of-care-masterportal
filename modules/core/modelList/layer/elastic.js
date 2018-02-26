define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        ElasticLayer;

    ElasticLayer = Layer.extend({
        initialize: function () {
            this.superInitialize();
            this.setStyleFunction(Radio.request("StyleList", "returnModelById", this.get("styleId")));
        },

        /**
         * [createLayerSource description]
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        /**
         * [createLayer description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId()
            }));
            this.requestData(this.parseData);
        },

        /**
         * sends request to elastic
         * @param  {Function} callback
         */
        requestData: function (callback) {
            Radio.trigger("Util", "showLoader");

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url") + this.get("typeName") + "/_search?size=10000"),
                type: "GET",
                context: this,
                success: callback,
                error: function () {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },

        /**
         * creates and add features from Elastic
         * @param  {JSON} data - Response from Elastic
         */
        parseData: function (data) {
            var features = [];

            _.each(data.hits.hits, function (hit) {
                var feature = new ol.Feature({
                    geometry: this.readAndGetGeometry(hit._source.geometry_EPSG_25832)
                });

                feature.setProperties(_.omit(hit._source, "geometry_UTM_EPSG_25832"));
                feature.setId(hit._id);
                // feature.setStyle(this.get("styleFunction"));
                features.push(feature);
            }, this);

            this.getLayerSource().addFeatures(features);
            this.getLayer().setStyle(this.get("styleFunction"));
            Radio.trigger("ElasticLayer", "featuresLoaded", this.getId(), features);
            Radio.trigger("Util", "hideLoader");
        },

        /**
         * Read a geometry from a GeoJSON source
         * @param  {object} geometry
         * @return {ol.geom.Geometry}
         */
        readAndGetGeometry: function (geometry) {
            var geojsonReader = new ol.format.GeoJSON();

            return geojsonReader.readGeometry(geometry, {
                dataProjection: "EPSG:25832"
            });
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
        }
    });

    return ElasticLayer;
});
