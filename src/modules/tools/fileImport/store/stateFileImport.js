/**
 * User type definition
 * @typedef {object} FileImportState
 * @property {boolean}  active - if true, component is rendered
 * @property {boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {string}   glyphicon - icon next to title
 * @property {string}   id - internal id of component
 * @property {boolean}  isActive - if true, component will be initially rendered
 * @property {string}   name - Module name
 * @property {boolean}  renderToWindow - if true, component is rendered in desktop only
 * @property {string}   parentId - Id of parent node
 * @property {boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {string}   selectedFiletype - This controls, which openlayers format is used when displaying the file data. Using "auto" will result in selecting one format according to the filename's suffix.
 * @property {array}   importedFileNames - list of names of successfully imported files
 * @property {object}   supportedFiletypes - Configuration object which is used to generate the selectedFiletype radio form from.
 * @property {string}   title - Module title
 * @property {string}   type - Module type
 */

export default {
    active: false,
    deactivateGFI: false,
    glyphicon: "glyphicon-load",
    id: "fileImport",
    isActive: false,
    name: "KML-Datei laden",
    onlyDesktop: true,
    parentId: "tool",
    renderToWindow: true,
    resizableWindow: false,
    selectedFiletype: "auto",
    importedFileNames: [],
    supportedFiletypes: {
        auto: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
        },
        kml: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.kml",
            rgx: /\.kml$/i
        },
        gpx: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.gpx",
            rgx: /\.gpx$/i
        },
        geojson: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.geojson",
            rgx: /\.(geo)?json$/i
        }
    },
    title: "KML-Datei laden",
    type: "tool"
};
