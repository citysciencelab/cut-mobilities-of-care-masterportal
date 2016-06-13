define(function () {

    var config = {

        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        tree: {
            type: "light",
            layer: [
                {id: "452", visible: true},
                {id: "453", visible: false, legendUrl: "ignore"},
                {id: "2486", visible: true, name: "ohne Thema"},
                {id: "2482", visible: true, name: "Wirtschaft"},
                {id: "2483", visible: true, name: "Umwelt"},
                {id: "2477", visible: true, name: "Wohnen"},
                {id: "2478", visible: true, name: "Gewerbe"},
                {id: "2479", visible: true, name: "Natur"},
                {id: "2480", visible: true, name: "Sport"},
                {id: "2481", visible: true, name: "Bildung"},
                {id: "2484", visible: true, name: "Verkehr"},
                {id: "2485", visible: true, name: "Verfahren"}
            ]
        },
        view: {
            center: [567108, 5928338],
            resolution: 15.874991427504629, // 1:250.000
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
        },
        footer: true,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        menuItems: {
            tree: {
                title: "Themen",
                glyphicon: "glyphicon-list"
            },
            tools: {
                title: "Werkzeuge",
                glyphicon: "glyphicon-wrench"
            },
            legend: {
                title: "Legende",
                glyphicon: "glyphicon-book"
            },
            contact: {
                title: "Kontakt",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        startUpModul: "",
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            placeholder: "Suche nach Adresse, Stadtteil"
        },
        print: {
            printID: "99999",
            title: "Zukunftsbild Elbinseln 2013",
            gfi: false
        },

        tools: {
             gfi: {
                 title: "Informationen abfragen",
                 glyphicon: "glyphicon-info-sign",
                 isActive: true
             },
             measure: {
                 title: "Strecke / Fläche messen",
                 glyphicon: "glyphicon-resize-full"
             }
         },

         controls: {
             zoom: true,
             toggleMenu: true,
             orientation: "once",
             poi: false,
             fullScreen: false
         }
    };

    return config;
});
