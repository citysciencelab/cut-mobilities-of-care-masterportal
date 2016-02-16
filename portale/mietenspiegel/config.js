define(function () {
    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 2.6458319045841048 // 1:10000
        },
        footer: false,
        quickHelp: false,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "2835", visible: true, gfiTheme: "mietenspiegel"},
                {id: "2830", visible: false, displayInTree: false},
                {id: "2831", visible: false, displayInTree: false}
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "allways"
        },
        attributions: false,
        menubar: true,
        scaleLine: true,
        mouseHover: false,
        isMenubarVisible: true,
        menu: {
            viewerName: "Mietenspiegel HH",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche nach Adresse",
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: false,
                searchParcels: false
            },
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Freie und Hansestadt Hamburg - Mietenspiegel",
            outputFilename: "Ausdruck Hamburger Mietenspiegel",
            gfi: true
        },
        tools: {
            parcelSearch: {
                title: "Flurstückssuche",
                glyphicon: "glyphicon-search"
            },
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            print: {
                title: "Karte drucken",
                glyphicon: "glyphicon-print"
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-record"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
