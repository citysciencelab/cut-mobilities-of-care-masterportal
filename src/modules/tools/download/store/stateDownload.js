/**
 *
 */
const state = {
    active: false,
    blob: undefined,
    colorConstants: [],
    dataString: "",
    features: [],
    fileName: "",
    formats: ["KML", "GEOJSON", "GPX"], // TODO(roehlipa): Can this be configured?
    glyphicon: "glyphicon-plus", // TODO(roehlipa): Really needed?
    id: "download",
    isInternetExplorer: undefined,
    name: "Download", // TODO(roehlipa): Really needed?
    renderToWindow: true, // TODO(roehlipa): Really needed?
    selectedFormat: ""
};

// TODO add these to the send errors:
//  createFirstText - "common:modules.tools.download.createFirst"
//  unknownGeometry - "common:modules.tools.download.unknownGeometry"

export default state;
