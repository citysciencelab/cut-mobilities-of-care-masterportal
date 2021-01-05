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
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    selectedSourceLayer: null,
    selectedTargetLayer: null,
    vectorLayer: {},
    resultLayer: {},
    bufferRadius: 0
};

export default state;
