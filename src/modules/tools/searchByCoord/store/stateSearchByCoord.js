const state = {
    // mandatory
    active: false,
    id: "searchByCoord",
    projections: [],
    mapProjection: null,
    positionMapProjection: [],
    updatePosition: true,
    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""},
    coordinatesNorthing: {id: "northing", name: "", value: "", errorMessage: ""},
    coordinateSystems: ["ETRS89", "WGS84", "WGS84(Dezimalgrad)"],
    currentProjectionName: "EPSG:25832",
    currentProjection: null,
    currentSelection: "ETRS89",
    coordinatesEastingField: "",
    coordinatesNorthingField: "",
    coordinatesEastingExample: "",
    coordinatesNorthingExample: "",
    selectedCoordinates: [],
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
