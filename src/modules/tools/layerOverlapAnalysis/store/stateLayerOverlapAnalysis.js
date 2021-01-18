import * as jsts from "jsts/dist/jsts";
import {Fill, Stroke, Style} from "ol/style";

/**
 * User type definition
 * @typedef {Object} LayerOverlapAnalysisState
 * @property {Boolean} active if true, LayerOverlapAnalysis will rendered
 * @property {String} id id of the LayerOverlapAnalysis component
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "layerOverlapAnalysis",
    name: "Layer-Überschneidung analysieren",
    glyphicon: "glyphicon-resize-full",
    timerId: null,
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    selectedSourceLayer: null,
    selectedTargetLayer: null,
    bufferLayer: {},
    resultLayer: {},
    bufferRadius: 0,
    resultType: false,
    options: [],
    map: null,
    parser: new jsts.io.OL3Parser(),
    resultLayerStyle: new Style({
        fill: new Fill({
            color: ["105", "175", "105", "0.7"]
        }),
        stroke: new Stroke({
            color: ["0", "135", "255", "0.7"],
            width: 2
        })
    }),
    bufferLayerStyle: new Style({
        fill: new Fill({
            color: ["255", "230", "65", "0.3"]
        }),
        stroke: new Stroke({
            color: ["255", "50", "0", "0.5"],
            width: 2
        })
    })
};

export default state;
