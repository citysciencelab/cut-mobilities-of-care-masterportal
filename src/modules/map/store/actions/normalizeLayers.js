/**
 * @typedef {object} LayerData minimal implementation, more to come
 * @property {string} name layer name
 * @property {boolean} visibility layer visibility
 * @property {number} opacity layer opacity in [0, 1] range
 * @property {module:ol/layer} olLayer openlayers layer object kept for quick access
 */

/**
 * Normalizes layer data of map for easy access.
 * @param {module:ol/Layer[]} layerArray array of layers of ol/Map
 * @returns {[object, LayerData[]]} returns layer byId and idList according to store normalization
 */
function normalizeLayers (layerArray) {
    const layers = {},
        layerIds = [];

    layerArray.forEach(layer => {
        const id = layer.get("id");

        if (typeof id !== "undefined") {
            layerIds.push(id);
            layers[id] = {
                name: layer.get("name") || "Unbenannter Layer",
                visibility: layer.getVisible(),
                opacity: layer.getOpacity(),
                olLayer: layer
            };
        }
    });

    return [
        layers,
        layerIds
    ];
}

export default normalizeLayers;
