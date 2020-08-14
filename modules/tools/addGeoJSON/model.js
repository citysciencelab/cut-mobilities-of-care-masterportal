const AddGeoJSON = Backbone.Model.extend(/** @lends AddGeoJSON.prototype */{
    defaults: {},

    /**
     * @class AddGeoJSON
     * @description Module to add a geoJSON-Layer.
     * @extends Tool
     * @memberof Tools.AddGeoJSON
     * @constructs
     * @listens Tools.AddGeoJSON#RadioTriggerAddGeoJSONAddGeoJsonToMap
     * @fires Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     */
    initialize: function () {
        const channel = Radio.channel("AddGeoJSON");

        this.listenTo(channel, {
            "addGeoJsonToMap": this.addGeoJsonToMap
        });
    },

    /**
     * Inserts the geodata from a GeoJSON into a new layer.
     *
     * @param {String} layerName The name of the layer (can be selected alphanumerically).
     * @param {String} layerId The Id of the layer (can be selected alphanumerically, but should be unique).
     * @param {(String | object)} geojson A valid GeoJSON. If no crs is defined in the JSON, EPSG:4326 is assumed.
     * @param {String} [styleId] Id for the styling of the features; should correspond to a style from the style.json.
     * @param {String} [parentId] Id for the correct position of the layer in the layertree.
     * @param {String} [gfiAttributes] Attributes to be shown when clicking on the feature using the GFI tool.
     * @fires Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @returns {void}
     */
    addGeoJsonToMap: function (layerName, layerId, geojson, styleId, parentId, gfiAttributes) {
        Radio.trigger("Parser", "addGeoJSONLayer", layerName, layerId, geojson, styleId, parentId, gfiAttributes);
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
    }
});

export default AddGeoJSON;
