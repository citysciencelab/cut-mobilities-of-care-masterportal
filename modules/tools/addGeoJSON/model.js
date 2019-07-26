const AddGeoJSON = Backbone.Model.extend(/** @lends AddGeoJSON.prototype */{
    defaults: {},

    /**
     * @class AddGeoJSON
     * @description Module to add geoJSON-Layer.
     * @extends Tool
     * @memberof Tools.AddGeoJSON
     * @constructs
     * @listens Tools.AddGeoJSON#RadioTriggerAddGeoJSONAddGeoJsonToMap
     * @fires Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     */
    initialize: function () {
        var channel = Radio.channel("AddGeoJSON");

        this.listenTo(channel, {
            "addGeoJsonToMap": this.addGeoJsonToMap
        });
    },

    /**
     * Inserts the geodata from a GeoJson into a new layer.
     * @param {String} layerName - The name of the layer (can be selected alphanumerically)
     * @param {String} layerId - The Id of the layers (can be selected alphanumerically, but should be unique)
     * @param {String} geojson - A valid GeoJson. If no crs is defined in the Json, EPSG:4326 is assumed..
     * @fires Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @returns {void}
     */
    addGeoJsonToMap: function (layerName, layerId, geojson) {
        Radio.trigger("Parser", "addGeoJSONLayer", layerName, layerId, geojson);
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
    }
});

export default AddGeoJSON;
