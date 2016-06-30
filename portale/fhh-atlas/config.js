define(function () {
    var config = {
        title: "FHH - Atlas",
        logo: "../img/hh-logo.png",
        simpleMap: true,
        tree: {
            type: "default",
            orderBy: "opendata",
            // saveSelection: true,
            baseLayer: [
                {id: "453", minScale: "500"},
                {id: "8"},
                {id: "717", visibility: true, minScale: "1000", name: "Geobasiskarten (farbig)"},
                {id: "713", minScale: "1000", name: "Geobasiskarten (schwarz-weiß)"},
                {id: "1043", minScale: "1000", name: "Geobasiskarten (grau-blau)"},
                {id: "368", name: "ALKIS farbig", maxScale: "10000"},
                {id: "149", name: "ALKIS grau-blau", maxScale: "10000"}
            ],
            // layerIDsToMerge: [
            //     ["149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178"],
            //     ["368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397"],
            //     ["717", "718", "719", "720"],
            //     ["713", "714", "715", "716"],
            //     ["1043", "1044", "1045", "1046"]
            // ],
            layerIDsToIgnore: [
                "1912", "1913", "1914", "1915", "1916", "1917" // UESG
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
                    "legendURL": ["http://87.106.16.168/legende_mrh/hvv-faehre.png", "http://87.106.16.168/legende_mrh/hvv-bahn.png", "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ],
            metaIDsToMerge: [
                // "38575F13-7FA2-4F26-973F-EDED24D937E5", // Landesgrundbesitzverzeichnis
                // "757A328B-415C-4E5A-A696-353ABDC80419", // ParkraumGIS
                "4AC1B569-65AA-4FAE-A5FC-E477DFE5D303", // Großraum- und Schwertransport-Routen in Hamburg
                "3EE8938B-FF9E-467B-AAA2-8534BB505580", // Bauschutzbereich § 12 LuftVG Hamburg
                "19A39B3A-2D9E-4805-A5E6-56A5CA3EC8CB", // Straßen HH-SIB
                "F691CFB0-D38F-4308-B12F-1671166FF181", // Flurstücke gelb
                "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1" // Flurstücke schwarz
            ],
            metaIDsToIgnore: [
                "DFA37E3E-F640-47DE-B7EF-3D3FFB11435C", // Störfallbetriebe Internet
                "09DE39AB-A965-45F4-B8F9-0C339A45B154", // MRH Fachdaten
                "51656D3F-E801-497C-952C-4F1F605843DD", // MRH Metrokarte
                "AD579C62-0471-4FA5-8C9A-38B3DCB5B2CB", // MRH Übersichtskarte-blau
                "14E3AFAE-99BE-4F1D-A3A6-6A68A1CDAC7B", // MRH Übersichtskarte-grün
                "56110E55-72C7-41F2-9F92-1C598E4E0A02", // Digitale Karte Metropolregion
                "88A22736-FE87-46F7-8A38-84F9E0E945F7", // TN für Olympia
                "DDB01922-D7B5-4323-9DDF-B68A42C559E6", // Olympiastandorte
                "AA06AD76-6110-4718-89E1-F1EDDA1DF4CF", // Regionales Raumordnungsprogramm Stade+Rotenburg
                "1C8086F7-059F-4ACF-96C5-7AFEB8F8B751", // Fachdaten der Metropolregion
                "A46086BA-4A4C-48A4-AC1D-9735DDB4FDDE", // Denkmalkartierung FIS
                "98377F7D-84AB-4089-BDF1-F962B2C173CC" // Ausgleichsflächen Internet
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            mousePosition: true,
            fullScreen: true
        },
        csw: {
            id: "1"
        },
        attributions: true,
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
                    "alias_mobil": "LGV Hamburg"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                    "alias": "SDP Download"
                },
                {
                    "bezeichnung": "",
                    "url": "http://www.hamburg.de/bsu/timonline",
                    "alias": "Kartenunstimmigkeit"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/fhh-atlas_alt/",
                    "alias": "Zum alten FHH-Atlas"
                }
            ]
        },
        quickHelp: true,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            extent: [442800, 5809000, 738000, 6102200]
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: false,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            // viewerName: "FHH - Atlas",
            // searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
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
            contact: {
                title: "Kontakt",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        startUpModul: "",
        searchBar: {
            minChars: 3,
            placeholder: "Suche Adresse, Stadtteil, Themen, Flurstück",
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            }
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
                title: "Zeichnen / Schreiben",
                glyphicon: "glyphicon-pencil"
            },
            kmlimport: {
                title: "KML Import",
                glyphicon: "glyphicon-import"
            }
        },
        gemarkungen: "../components/lgv-config/gemarkung.json",
        print: {
            printID: "99999",
            title: "Freie und Hansestadt Hamburg - Atlas",
            outputFilename: "Ausdruck FHH - Atlas",
            gfi: true
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
