define(function () {
    var config = {
        title: "Schulbau-Portal",
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            background: "white",
           //center: [565874, 5934140],
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
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
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
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
        layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
       
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",
        print: {
            printID: "99999",
            title: "Schulbau-Portal",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
