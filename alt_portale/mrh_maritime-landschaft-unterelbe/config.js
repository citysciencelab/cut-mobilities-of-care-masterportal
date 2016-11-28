define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        // title: "Maritime Landschaft Unterelbe",
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            background: "white"
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        // customModules: ["../portale/master/verkehrsfunctions"],
        footer: {
            visibility: true,
            urls: [
                {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/kontakte.htm",
                        "alias": "Kontakte",
                        "alias_mobil": "Kontakte"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/copyright.htm",
                        "alias": "Copyright",
                        "alias_mobil": "Copyright"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/links.htm",
                        "alias": "Linkliste",
                        "alias_mobil": "Linkliste"
                    }
            ]
        },
        view: {
            resolution: 76.43718115953851,
            options: [
                {
                    resolution: 611.4974492763076,
                    scale: "2311167",
                    zoomLevel: 0
                },
                {
                    resolution: 305.7487246381551,
                    scale: "1155583",
                    zoomLevel: 1
                },
                {
                    resolution: 152.87436231907702,
                    scale: "577791",
                    zoomLevel: 2
                },
                {
                    resolution: 76.43718115953851,
                    scale: "288896",
                    zoomLevel: 3
                },
                {
                    resolution: 38.21859057976939,
                    scale: "144448",
                    zoomLevel: 4
                },
                {
                    resolution: 19.109295289884642,
                    scale: "72223",
                    zoomLevel: 5
                },
                {
                    resolution: 9.554647644942321,
                    scale: "36112",
                    zoomLevel: 6
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "18056",
                    zoomLevel: 7
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "9028",
                    zoomLevel: 8
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "4514",
                    zoomLevel: 9
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "2257",
                    zoomLevel: 10
                }
            ]
        },
        quickHelp: true,
        layerConf: "../components/lgv-config/services-mrh.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",
        print: {
            printID: "99999",
            title: "Maritime Landschaft Unterelbe",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
