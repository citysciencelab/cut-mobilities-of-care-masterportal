const Config = {
    wfsImgPath: "./ressources/img/",
    namedProjections: [
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
    ],
    footer: {
        urls: [
            {
                "bezeichnung": "common:modules.footer.designation",
                "url": "https://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ],
        showVersion: true
    },
    quickHelp: {
        imgPath: "./ressources/img/"
    },
    layerConf: "./ressources/services-internet.json",
    restConf: "./ressources/rest-services-internet.json",
    styleConf: "./ressources/style_v3.json",
    scaleLine: true,
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },
    useVectorStyleBeta: true,
    featureViaURL: {
        epsg: 4326,
        layers: [
            {
                id: "420",
                geometryType: "Point",
                name: "Übergebene Punkt Feature",
                styleId: "funky"
            },
            {
                id: "4200",
                geometryType: "LineString",
                name: "Übergebene Linien Feature"
            },
            {
                id: "4020",
                geometryType: "Polygon",
                name: "Übergebene Polygon Feature"
            }
        ]
    }
};

// conditional export to make config readable by e2e tests
if (typeof module !== "undefined") {
    module.exports = Config;
}
