/**
 * User type definition
 * @typedef {object} MapState
 * @property {?module:ol/Map} map currently active map instance
 * @property {?number} zoomLevel active zoom level
 * @property {?number} maxZoomLevel maximum zoom level
 * @property {?number} minZoomLevel minimum zoom level
 * @property {?number} scale scale 1:x, where x is saved here
 * @property {?number} resolution active resolution (changes with zoom level)
 * @property {?number} maxResolution maximum resolution
 * @property {?number} minResolution minimum resolution
 * @property {?[number, number]} mouseCoord last mouse position
 * @property {?[number, number]} center coordinate
 * @property {?[number, number, number, number]} bbox current bounding box
 * @property {?string} projection name of currently active projection
 * @property {?number} rotation current rotation
 * @property {?number[]} layerIds list of layer ids
 * @property {?object} layers register of existing layers TODO spec layer information
 * @property {?number[]} overlayIds list of layer ids
 * @property {?Array} overlays list of existing overlays TODO probably use layer information spec from above
 */
const state = {
    map: null,
    zoomLevel: null,
    maxZoomLevel: null,
    minZoomLevel: null,
    scale: null,
    resolution: null,
    maxResolution: null,
    minResolution: null,
    center: null,
    mouseCoord: null,
    bbox: null,
    projection: null,
    rotation: null,
    layerIds: null,
    layers: null,
    overlayIds: null,
    overlays: null
};

export default state;
