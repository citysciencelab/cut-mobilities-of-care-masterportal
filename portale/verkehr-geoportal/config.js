define(function () {

    var config = {
        wfsImgPath: "..components/lgv-config/img",
        allowParametricURL: true,
        tree: {
            type: "custom",
            layerIDsToMerge: [
                ["149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178"],
                ["368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397"],
                ["717", "718", "719", "720"],
                ["713", "714", "715", "716"],
                ["1043", "1044", "1045", "1046"]
            ],
            layerIDsToStyle: [
                {
                    "id": "1933",
                    "styles": "geofox_stations",
                    "name": "Haltestellen",
                    "legendURL": "http://87.106.16.168/legende_mrh/hvv-bus.png"
                },
                {
                    "id": "1935",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                        "legendURL": ["http://87.106.16.168/legende_mrh/hvv-faehre.png", "http://87.106.16.168/legende_mrh/hvv-bahn.png",
                        "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ],
            baseLayer: [
            {id: "452", visibility: false}, // luftbilder u
            {id: "713", visibility: false}, // stadtplan s-w
            {id: "453", visibility: false}, // stadtplan farbig
            {id:
             [
                 {
                     id: "946",
                     attribution:
                     {
                         eventname: "aktualisiereverkehrsnetz",
                         timeout: (10 * 60000)
                     }
                 },
                 {
                     id: "947"
                 }
             ],
             name: "Verkehrslage auf Autobahnen", visibility: false
            }
          ],
            customConfig: "../components/lgv-config/tree-config/verkehr_geoportal.json"
        },
        controls: {
            zoom: true,
            toggleMenu: true
        },
        feature_count: [
            {
                id: 1561,
                count: 5
            }
        ],
        view: {
            center: [566770, 5935620], // Alster
            extent: [454591, 5809000, 700000, 6075769]
            // resolution: 2.6458319045841048 // 1:10 000
        },
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",

        print: {
            printID: "99999",
            title: "BauInfoDienst-Portal",
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
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: true
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Thema",
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
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
            draw: {
                title: "Zeichnen",
                glyphicon: "glyphicon-pencil"
            },
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-search"
            }
        },
        gemarkungen: "../components/lgv-config/gemarkung.json",
        orientation: false,
        poi: false
    };

    return config;
});
