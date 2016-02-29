define(function () {

    var config = {
        wfsImgPath: "..components/lgv-config/img",
        allowParametricURL: true,
        tree: {
            type: "custom",
            orderBy: "olympia",
            customConfig: "../components/lgv-config/tree-config/verkehrsmodell.json",
            baseLayer: [
                {id: "453", visibility: true},
                {id: "452", visibility: false}
            ],
            layerIDsToStyle: [
                {
                    "id": "1933",
                    "styles": "geofox_stations",
                    "name": "Haltestellen",
                    "legendURL":"http://87.106.16.168/legende_mrh/hvv-bus.png"
                },
                {
                    "id": "1935",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                    "legendURL": ["http://87.106.16.168/legende_mrh/hvv-faehre.png",  "http://87.106.16.168/legende_mrh/hvv-bahn.png", "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ]
        },
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 66.14579761460263, // 1:250.000
            extent: [454591, 5809000, 700000, 6075769]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: false,
            poi: true
        },
        layerConf: "../components/lgv-config/services-verkehrsmodell.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        print: {
            printID: "99999",
            title: "Verkehrsmodell",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        menubar: true,
        mouseHover: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: false,
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
            }
        },

    };

    return config;
});
