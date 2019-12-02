/* eslint-disable no-unused-vars */

const Config = {
    wfsImgPath: "./resources/img/",
    namedProjections: [
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
    ],
    footer: {
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "https://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ]
    },
    quickHelp: {
        imgPath: "./resources/img/"
    },
    layerConf: "./resources/services-internet.json",
    restConf: "./resources/rest-services-internet.json",
    styleConf: "./resources/style_v2.json",
    scaleLine: true,
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    }
};

/* eslint-enable no-unused-vars */
