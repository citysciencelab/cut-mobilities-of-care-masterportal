define(function () {

    var config = {
         title: "Mobilitätsportal-Verkehr",
        logo: "../img/hh-logo.png",
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        tree: {
            type: "custom",
            saveSelection: true,
            layerIDsToMerge: [
               ["149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178"],
                ["368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397"],
                ["713", "714", "715", "716"],
                ["717", "718", "719", "720"],
                ["1043", "1044", "1045", "1046"],
                ["2709","2885","2890","2900"]
              ],
            layerIDsToStyle: [
                {
                    "id": "1935",
                    "styles": ["geofox-bahn", "geofox-bus", "geofox_BusName", "geofox_Faehre"],
                    "name": ["USAR-Bahnlinien", "Buslinien", "Busliniennummern", "Fährlinien"],
                    "legendURL": ["http://87.106.16.168/legende_mrh/hvv-bahn.png",
                        "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-faehre.png"]
                },
                {
                    "id": "1933",
                    "styles": "geofox_stations",
                    "name": "USAR-Stationen (ab 1:40.000), Bus-Haltestellen, Fähr-Stationen (ab 1:20.000)",
                    "legendURL": ["http://87.106.16.168/legende_mrh/hvv-bahn.png", "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-faehre.png"]
                }
            ],
            baseLayer: [
                {id: "452", visibility: false}, // luftbilder
                {id: "453", visibility: false}, // stadtplan farbig
                {id: "713", visibility: false}, // stadtplan s-w
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
                },
                {id: "717", visibility: true}, // geobasiskarten farbig
                {id: "1043", visibility: false}, // geobasiskarten grau-blau
                {id: "368", visibility: false}, // aLKIS farbig
                {id: "149", visibility: false} // aLKIS grau-blau
            ],

        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: true
        },
        feature_count: [
            {
                id: 1561, // festgestelte B-Pläne
                count: 5
            }
        ],
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            // resolution: 26.458319045841044,
            epsg: "EPSG:25832"
        },
        customModules: ["../portale/verkehr-mobilitaet/verkehrsfunctions"],
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",

        print: {
            printID: "99999",
            title: "Mobilitätsportal-Verkehr",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        menubar: true,
        attributions: true,
        mouseHover: true,
        scaleLine: true,
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
            },
            routing: {
                title: "Routenplaner",
                glyphicon: "glyphicon-road"
            },
            addWMS: {
                title: "WMS hinzufügen",
                glyphicon: "glyphicon-plus"
            }
        },
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,

            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: true,
            addWMS: true
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Thema",
            gazetteer: {
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            },
            visibleWFS: {
                minChars: 3
            },
            minChars: 3,
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
