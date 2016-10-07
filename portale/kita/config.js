define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        title: "Kita-Stadtplan",
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        zoomtofeature: {
            url: "http://geodienste.hamburg.de/Test_HH_WFST_Eventlotse",
            version: "2.0.0",
            typename: "app:hamburgconvention",
            valuereference: "app:flaechenid",
            imglink: "../img/location_eventlotse.svg",
            layerid: "4426"
        },
        view: {
            background: "white",
            resolution: 66.14579761460263
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
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
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
       
        attributions: true,
        // menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",
      
        print: {
            printID: "99999",
            title: "Kita-Stadtplan",
            gfi: true
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
