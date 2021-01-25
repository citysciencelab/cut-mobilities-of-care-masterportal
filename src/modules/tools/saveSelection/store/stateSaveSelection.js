const state = {
    active: false,
    id: "saveSelection",
    // defaults for config.json tool parameters
    name: "common:menu.tools.saveSelection",
    glyphicon: "glyphicon-share",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    // saveSelection state
    layerIds: [],
    layerList: [],
    layerTransparencies: [],
    layerVisibilities: []
};

export default state;
