const state = {
    active: false,
    id: "coord",
    selectPointerMove: null,
    projections: [],
    mapProjection: null,
    positionMapProjection: [],
    updatePosition: true,
    currentProjectionName: "EPSG:25832",
    currentSelection: "EPSG:25832",

    // defaults for config.json parameters
    name: "Koordinaten abfragen",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: true,
    resizableWindow: true,
    isActive: false,
    isVisibleInMenu: true,
    isRoot: false,
    parentId: "tool",
    type: "tool",
    deactivateGFI: true
};

export default state;
