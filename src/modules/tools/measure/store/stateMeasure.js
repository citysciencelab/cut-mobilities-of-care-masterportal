import VectorLayer from "ol/layer/Vector.js";

import style from "../measureStyle";
import source from "../measureSource";

// TODO when drawing, disable first select (or better, make selection reset state)

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
 * TODO add new properties
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

    // config.json parameters
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
