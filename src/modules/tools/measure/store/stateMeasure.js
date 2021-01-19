import VectorLayer from "ol/layer/Vector.js";

import style from "../measureStyle";
import source from "../measureSource";

/**
 * Measure tool state definition.
 * @typedef {Object} MeasureState
 * @property {Boolean} active if true, Measure will rendered
 * @property {String} id id of the Measure component
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} earthRadius earth radius to assume for length/area calculations (config-param)
 * @property {Boolean} showInaccuracy whether tooltip shows inaccuracy in default style (config-param)
 * @property {Object<String, module:ol/Feature>} lines line features by ol_uid
 * @property {Object<String, module:ol/Feature>} polygons polygon features by ol_uid
 * @property {module:ol/Overlay[]} overlays currently visible overlays with measurements
 * @property {String[]} geometryValues Available geometry values for measurement selection
 * @property {String[]} geometryValues3d Available geometry values for measurement selection in 3D mode
 * @property {String[]} lineStringUnits Available units for line measurement
 * @property {String[]} polygonUnits Available units for polygon measurement
 * @property {String} selectedGeometry Selected geometry value for measurement
 * @property {String} selectedUnit Selected unit by stringified index ("0"/"1")
 * @property {module:ol/Interaction} interaction current interaction on map, if any
 * @property {module:ol/vector/Source} source draw layer source
 * @property {module:ol/vector/Layer} layer draw layer
 */
const state = {
    active: false,
    id: "measure",

    // defaults for config.json tool parameters
    name: "Strecke / Fläche messen",
    glyphicon: "glyphicon-resize-full",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,

    // tool-specific config.json parameters
    earthRadius: 6378137,
    showInaccuracy: true,

    // measure form state and UI
    lines: {},
    polygons: {},
    overlays: [],
    geometryValues: ["LineString", "Polygon"],
    geometryValues3d: ["3D"],
    lineStringUnits: ["m", "km"],
    polygonUnits: ["m²", "km²"],
    selectedGeometry: "LineString",
    selectedUnit: "0",

    // measure layer and ol
    interaction: null,
    source,
    layer: new VectorLayer({
        source,
        style,
        name: "measure_layer",
        alwaysOnTop: true
    })
};

export default state;
