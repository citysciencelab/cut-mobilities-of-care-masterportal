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
export default function addGeoJSON (layerName, layerId, geojson, styleId, parentId, gfiAttributes) {
    Radio.trigger("Parser", "addGeoJSONLayer", layerName, layerId, geojson, styleId, parentId, gfiAttributes);
    Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
}
