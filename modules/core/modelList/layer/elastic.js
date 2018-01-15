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
                feature.setId(hit.id);
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
        }
    });

    return ElasticLayer;
});
