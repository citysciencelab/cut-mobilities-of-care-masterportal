define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        ElasticLayer;

    ElasticLayer = Layer.extend({
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
         * [createLayer description]
         * @return {[type]} [description]
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
                url: Radio.request("Util", "getProxyURL", this.get("url")),
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
                features.push(feature);
            }, this);

            this.getLayerSource().addFeatures(features);
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
                var feature = this.getLayerSource().getFeatureById(id),
                    style = [];

                style = this.getStyleAsFunction(this.get("style"));

                feature.setStyle(style(feature));
            }, this);
        },

        /**
         * Versteckt alle Features mit dem Hidden-Style
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures(),
                that = this;

            collection.forEach(function (feature) {
                feature.setStyle(function () {
                    return that.getHiddenStyle();
                });
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
                    fill: new ol.style.Fill({
                        color: "rgba(0, 0, 0, 0)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(0, 0, 0, 0)"
                    })
                })
            });
        }
    });

    return ElasticLayer;
});
