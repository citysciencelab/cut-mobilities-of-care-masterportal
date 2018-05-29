define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        //title: "Gesundheits- und Pflegekonferenz Eimsbüttel",
        simpleMap: false,
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [562674, 5940033],// Eimsbüttel
            background: "white"
           /* center: [565874, 5934140],
            epsg: "EPSG:25832"
            */
        },
        //customModules: ["../portale/master/verkehrsfunctions"],
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
                    "alias_mobil": "LGV"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                    "alias": "SDP Download",
                    "alias_mobil": "SDP"
                },
                {
                    "bezeichnung": "",
                    "url": "http://www.hamburg.de/bsu/timonline",
                    "alias": "Kartenunstimmigkeit"
                }
            ]
        },
        quickHelp: true,
        layerConf: "../node_modules/lgv-config/services-fhhnet-ALL.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",

        attributions: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        print: {
            printID: "99999",
            title: "Gesundheits- und Pflegekonferenz Eimsbüttel",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../node_modules/lgv-config/gemarkung.json"
    };

    return config;
});
