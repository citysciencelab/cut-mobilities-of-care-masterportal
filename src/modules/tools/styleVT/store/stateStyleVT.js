/**
 * @property {Boolean} active Current status of the Tool.
 * @property {Boolean} deactivateGFI If set to true, the activation of this Tool deactivates the GFI Tool.
 * @property {String} glyphicon Glyphicon used in the header of the window.
 * @property {String} id Internal identifier for the Tool.
 * @property {Backbone/Model/Item/Layer/VTLayer} layerModel Currently selected model of a Vector Tile Layer to style.
 * @property {String} name Title displayed at the top of the window of the Tool; can be configured through the config.json.
 * @property {Boolean} renderToWindow Decides whether the Tool should be displayed as a window or as a sidebar.
 * @property {Boolean} resizableWindow Determines whether the Tool window can be resized.
 * @property {Array<Backbone/Model/Item/Layer/VTLayer>} vectorTileLayerList Array of visible Vector Tile Layers selectable to style.
 */
const state = {
    active: false,
    deactivateGFI: true,
    glyphicon: "glyphicon-tint",
    id: "styleVT",
    layerModel: null,
    name: "Style VT",
    renderToWindow: true,
    resizableWindow: true,
    vectorTileLayerList: []
};

export default state;
