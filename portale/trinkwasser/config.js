define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        allowParametricURL: false,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 66.14579761460263 // // 1:100.000
        },
        tree: {
            type: "light",
            layer: [
                {id: "38", visible: true},
                {id: "9999", gfiTheme: "trinkwasser", visible: true, featureCount: 5}
            ]
        },
        layerConf: "../portale/trinkwasser/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once"
        },
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        treeConf: "../components/lgv-config/tree.json",
        menubar: true,
        scaleLine: false,
        isMenubarVisible: true,
        menu: {
          routing: false
        },
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
            treeFilter: {
                title: "Filter",
                glyphicon: "glyphicon-leaf"
            }
        },
        startUpModul: "",
        searchBar: {
            gazetteer: {
                url: "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            placeholder: "Adresssuche",
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Trinkwasser",
            gfi: false
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
            },
            draw: {
                title: "Zeichnen",
                glyphicon: "glyphicon-pencil"
            }
        },
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
