const AddGeoJSON = Backbone.Model.extend({
    defaults: {},
    initialize: function () {
        var channel = Radio.channel("AddGeoJSON");

        this.listenTo(channel, {
            "addGeoJsonToMap": this.addGeoJsonToMap
        });
    },
    /**
     * Fügt die Geodaten aus einer GeoJson in eine neue Layer ein.
     * @param {String} layerName Der Name der Layer (Kann beliebig alphanumerisch gewählt werden)
     * @param {String} layerId   Die Id der Layer (Kann beliebig alphanumerisch gewählt werden, sollte aber unique sein)
     * @param {String} geojson   Ein valides GeoJson. Wird kein crs in dem Json definiert, dann wird EPSG:4326 angenommen.
     * @returns {void}
     */
    addGeoJsonToMap: function (layerName, layerId, geojson) {
        Radio.trigger("Parser", "addGeoJSONLayer", layerName, layerId, geojson);
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
    }
});

export default AddGeoJSON;
