define(function () {
    var config = {
        title: "HH Straßen- und Gebietsauskunft",
        logo: "../img/stano.png",
        logoLink: "http://www.statistik-nord.de/",
        logoTooltip: "Statistikamt Nord",
        
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            background: "white"
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        customModules: ["../portale/master/verkehrsfunctions"],
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Impressum: ",
                    "url": "http://www.statistik-nord.de/impressum/",
                    "alias": "Statistikamt Nord",
                    "alias_mobil": "StaNo"
                },
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
                    "alias_mobil": "LGV"
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
            title: "Hamburger Straßen- und Gebietsauskunft",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
