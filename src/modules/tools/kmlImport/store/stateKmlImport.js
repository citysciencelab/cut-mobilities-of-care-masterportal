/**
 * User type definition
 * @typedef {object} KmlImportState
 * @property {string} id - internal id of component
 * @property {boolean} active - if true, component will be initially rendered
 * @property {string} title - Module title
 * @property {string} glyphicon - icon next to title
 * @property {boolean} renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {boolean} resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {boolean} isVisibleInMenu - if true, component is activatable in menu
 * @property {boolean} deactivateGFI - if true, component activation deactivates gfi component
 */

export default {
    id: "kmlImport",
    active: false,
    deactivateGFI: false,
    glyphicon: "glyphicon-load",
    renderToWindow: true,
    resizableWindow: false,
    title: "KML-Datei laden",

    selectedFiletype: "auto",
    alertingMessages: {
        filetypeError: {
            category: "Fehler",
            content: "Datei konnte nicht gelesen werden. Bitte prüfen Sie, ob das Format der Datei mit dem gewählten Format überreinstimmt."
        },
        success: {
            category: "Info",
            content: "Die Datei \"%s\" wurde erfolgreich importiert."
        }
    },
    supportedFiletypes: {
        auto: {
            caption: "common:modules.tools.kmlImport.captions.supportedFiletypes.auto"
        },
        kml: {
            caption: "common:modules.tools.kmlImport.captions.supportedFiletypes.kml",
            rgx: /\.kml$/i
        },
        gpx: {
            caption: "common:modules.tools.kmlImport.captions.supportedFiletypes.gpx",
            rgx: /\.gpx$/i
        },
        geojson: {
            caption: "common:modules.tools.kmlImport.captions.supportedFiletypes.geojson",
            rgx: /\.(geo)?json$/i
        }
    }
};
