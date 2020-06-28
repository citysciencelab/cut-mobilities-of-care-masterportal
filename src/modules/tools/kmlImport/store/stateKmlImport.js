export default {
    active: false,
    deactivateGFI: false,
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
    },
    glyphicon: "glyphicon-load",
    id: "kmlImport",
    renderToWindow: true,
    resizableWindow: false,
    sourceRaw: null,
    title: "KML-Datei laden"
};
