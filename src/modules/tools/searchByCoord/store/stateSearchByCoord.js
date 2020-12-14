const state = {
    // mandatory
    active: false,
    id: "searchByCoord",
    projections: [],
    mapProjection: null,
    positionMapProjection: [],
    updatePosition: true,
    currentProjectionName: "EPSG:25832",
    currentProjection: null,
    currentSelection: "EPSG:25832",
    coordinatesEastingField: "",
    coordinatesNorthingField: "",
    // mandatory defaults for config.json parameters
    name: "Koordinatensuche",
    glyphicon: "glyphicon-record",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;
