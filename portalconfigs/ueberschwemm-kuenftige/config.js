define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        title: "Übertschwemmungsgebiete(voläufig gesichert)",
        gfiWindow: "detached",
        simpleMap: false,
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        view: {
            background: "white"
             //center: [565686, 5942986] //Flughafen
           /* center: [565874, 5934140],
            epsg: "EPSG:25832"
            */
        },
        namedProjections: [
        // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        //customModules: [ ],
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
        layerConf: "../node_modules/lgv-config/services-internet.json",
        restConf: "../node_modules/lgv-config/rest-services-internet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",

        attributions: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        print: {
            printID: "99999",
            title: "Übertschwemmungsgebiete(voläufig gesichert)",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../node_modules/lgv-config/gemarkung.json"
    };

    return config;
});
