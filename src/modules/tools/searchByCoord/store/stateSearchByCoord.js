const state = {
    // mandatory
    active: false,
    id: "searchByCoord",
    projections: [],
    mapProjection: null,
    positionMapProjection: [],
    updatePosition: true,
    coordinateSystems: ["ETRS89", "WGS84", "WGS84(Dezimalgrad)"],
    currentProjectionName: "EPSG:25832",
    currentProjection: null,
    currentSelection: "ETRS89",
    coordinatesEastingField: "",
    coordinatesNorthingField: "",
    coordinatesEastingExample: "",
    coordinatesNorthingExample: "",
    zoomLevel: 7,
    // mandatory defaults for config.json parameters
    name: "Koordinatensuche",
    glyphicon: "glyphicon-record",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;
