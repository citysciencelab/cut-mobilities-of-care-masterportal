const Config = {
    clickCounter: {},
    footer: {
        visibility: true,
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "https://geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ]
    },
    gfiWindow: "attached",
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },
    namedProjections: [
        // GK DHDN
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        // ETRS89 UTM
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        // LS 320: zusammen mit Detlef Koch eingepflegt und geprüft
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        // WGS84
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    portalConf: "../../../../../test/end2end/resources/configs/custom",
    remoteInterface: {
        postMessageUrl: "http://localhost:9001"
    },
    proxyURL: "/cgi-bin/proxy.cgi",
    quickHelp: {
        imgPath: "https://geoportal-hamburg.de.de/lgv-config/img/"
    },
    layerConf: "https://geodienste.hamburg.de/services-internet.json",
    restConf: "https://geoportal-hamburg.de/lgv-config/rest-services-internet.json",
    styleConf: "https://geoportal-hamburg.de/lgv-config/style_v2.json",
    wfsImgPath: "https://geoportal-hamburg.de/lgv-config/img/",
    zoomToFeature: {
        attribute: "flaechenid",
        styleId: "location_eventlotse",
        wfsId: "4560"
    },
    scaleLine: true,
    simpleMap: false,
    startingMap3D: false,
    obliqueMap: true,
    cesiumParameter: {
        tileCacheSize: 20,
        enableLighting: true,
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        maximumScreenSpaceError: 2,
        fxaa: true
    }
};

// conditional export to make config readable by e2e tests
if (module) {
    module.exports = Config;
}
