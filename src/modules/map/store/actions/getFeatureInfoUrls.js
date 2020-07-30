import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import GroupLayer from "ol/layer/Group";

/**
 * Creates and returns urls for the GetFeatureInfo Request of all visible wms layer at the given coordinate
 * @param {Object} map - openlayers map object
 * @param {number[]} coordinate - coordinate for the gfi request
 * @returns {string[]} Gfi urls of all visible wms layer
 */
function getFeatureInfoUrls (map, coordinate) {
    const urlList = [],
        resolution = map.getView().getResolution(),
        projection = map.getView().getProjection(),
        visibleWmsLayers = map.getLayers().getArray().filter(layer => {
            return layer.getVisible() === true && (layer instanceof TileLayer || layer instanceof ImageLayer || layer instanceof GroupLayer);
        });

    visibleWmsLayers.forEach(layer => {
        // LayerGroup
        if (layer.get("layers")) {
            layer.get("layers").getArray().forEach(groupedLayer => {
                if (groupedLayer instanceof TileLayer || groupedLayer instanceof ImageLayer) {
                    urlList.push(groupedLayer.getSource().getFeatureInfoUrl(coordinate, resolution, projection, {info_format: groupedLayer.get("infoFormat")}));
                }
            });
        }
        else {
            urlList.push(layer.getSource().getFeatureInfoUrl(coordinate, resolution, projection, {info_format: layer.get("infoFormat")}));
        }
    });

    return urlList;
}

export default getFeatureInfoUrls;
