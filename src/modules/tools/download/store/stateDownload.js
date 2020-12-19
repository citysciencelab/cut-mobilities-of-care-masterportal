/**
 * TODO: description
 */
const state = {
    active: false,
    blob: undefined,
    dataString: "",
    deativateGfi: false,
    disableDownload: true,
    features: [],
    fileUrl: "",
    fileContent: "",
    fileName: "",
    formats: ["KML", "GEOJSON", "GPX"], // TODO(roehlipa): Can this be configured somewhere?
    glyphicon: "glyphicon-plus",
    id: "download",
    isInternetExplorer: undefined,
    renderToWindow: true,
    selectedFormat: ""
};

export default state;
