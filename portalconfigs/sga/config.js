define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        gfiAtClick: false,
        simpleMap: false,
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        view: {
            background: "white"
           /* center: [565874, 5934140],
            epsg: "EPSG:25832"
            */
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        customModules: ["../portalconfigs/sga/gfionaddress/view"],
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Impressum: ",
                    "url": "http://www.statistik-nord.de/impressum/",
                    "alias": "Statistikamt Nord",
                    "alias_mobil": "StaNord"
                },
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
                    "alias_mobil": "LGV"
                }
            ]
        },
        quickHelp: true,
        layerConf: "../node_modules/lgv-config/services-fhhnet-All.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../node_modules/lgv-config/gemarkung.json"
    };

    return config;
});
