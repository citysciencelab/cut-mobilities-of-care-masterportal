define(function () {

    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "1727", visible: true, name: "Kooperationsprojekte mit Hamburger Nachbargemeinden u. -kreisen"}
            ]
        },

        view: {
            center: [565874, 5939000],
            resolution: 66.14579761460263, // 1:250.000
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
        },
        footer: true,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",


        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,

        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
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
            visibleWFS: {
                minChars: 3
            },
            placeholder: "Suche nach Adresse, Stadtteil",
            geoLocateHit: true
        },

        print: {
            printID: "99999",
            title: "SUBURBIA",
            gfi: true
        },

       tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },

        orientation: true,

        poi: false
    };

    return config;
});
