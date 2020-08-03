import {MapMode} from "./enums";
// TODO add 3d mode values (or model them as a separate module for composition)

/**
 * User type definition
 * @typedef {object} MapState
 * @property {?module:ol/Map} map currently active map instance
 * @property {?module:ol/layer[]} layerList - all layers of the map
 * @property {object[]} gfiFeatures - features for the gfi
 * @property {?number} initialZoomLevel initial zoom level
 * @property {?number} zoomLevel active zoom level
 * @property {?number} maxZoomLevel maximum zoom level
 * @property {?number} minZoomLevel minimum zoom level
 * @property {?number} scale scale 1:x, where x is saved here
 * @property {?number} initialResolution initial resolution
 * @property {?number} resolution active resolution (changes with zoom level)
 * @property {?number} maxResolution maximum resolution
 * @property {?number} minResolution minimum resolution
 * @property {?[number, number]} clickCoord - the coordinate where the mouse click event triggered
 * @property {?[number, number]} clickPixel - the pixel where the mouse click event triggered relative to the viewport
 * @property {?Object[]} featuresAtCoordinate - features at the click coordinate
 * @property {?[number, number]} initialCenter initial center coordinate
 * @property {?[number, number]} center coordinate
 * @property {?[number, number, number, number]} bbox current bounding box
 * @property {?string} projection name of currently active projection
 * @property {?number} rotation current rotation
 * @property {?number[]} layerIds list of layer ids
 * @property {?object.<string, LayerData>} layers register of existing layers
 * @property {?number[]} overlayIds list of layer ids
 * @property {?object.<string, LayerData>} overlays list of existing overlays
 * @property {MapMode} mapMode
 */
const state = {
    map: null,
    layerList: null,
    gfiFeatures: null,
    initialZoomLevel: null,
    zoomLevel: null,
    maxZoomLevel: null,
    minZoomLevel: null,
    scale: null,
    initialResolution: null,
    resolution: null,
    maxResolution: null,
    minResolution: null,
    scales: null,
    initialCenter: null,
    center: null,
    clickCoord: null,
    clickPixel: null,
    mouseCoord: null,
    bbox: null,
    projection: null,
    rotation: null,
    layerIds: null,
    layers: null,
    overlayIds: null,
    overlays: null,
    mapMode: MapMode.MODE_2D
};

export default state;
