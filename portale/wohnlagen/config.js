define(function () {

    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "2515", visible: true} // Wohnlagen
            ]
        },

        view: {
            center: [565874, 5934140],  // Rathausmarkt
            resolution: 10.583327618336419, // 1:40.000
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
            
           
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: false,
            poi: false
        },
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
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
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            },
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Wohnlagenverzeichnis Hamburg",
            gfi: false
        },
         tools: {
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
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
             draw: {
                title: "Zeichnen",
                glyphicon: "glyphicon-pencil"
            },
        },
        orientation: false,
        poi: true
    };

    return config;
});
