define(function () {

    var config = {
            ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
            simpleMap: true,
            tree: {
                orderBy: "opendata",
                saveSelection: true,

                layerIDsToMerge: [
                    ["149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178"],
                    ["368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397"],
                    ["717", "718", "719", "720"],
                    ["713", "714", "715", "716"],
                    ["1043", "1044", "1045", "1046"]
                ],
                layerIDsToIgnore: [
                    "1912", "1913", "1914", "1915", "1916", "1917", // UESG
                    "2298", // Straßenbaumkataster cache grau
                    "1791", // nachträgliche Bodenrichtwerte lagetypisch 1964
                    "2627", "2628", "2629", "2630", "2631", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", // StaNord, wird bald abgeschaltet
                    "2640", "2641", "2642", "2643", "2644", "2645", "2646", "2647", "2648", "2649", "2650", "2651", // StaNord, wird bald abgeschaltet
					"215", "216", "217", "218", "219", // Zuständigkeitsgrenzen
                    "8713" // Layer Schulinfo
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
                    "F691CFB0-D38F-4308-B12F-1671166FF181", // Flurstücke gelb
                    "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1" // Flurstücke schwarz
                ],
                metaIDsToIgnore: [
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
				    "DB433BD1-1640-4FBC-A879-72402BD5CFDB", // Bodenrichtwertzonen Hamburg
				    "6A0D8B9D-1BBD-441B-BA5C-6159EE41EE71", // Bodenrichtwerte für Hamburg
					"3233E124-E576-4B5D-978E-164720C4E75F" // MRH Große Verkehrsprojekte
			    ]
            },
            scaleLine: true,

            footer: {
                visibility: true,
                urls: [
                    {
                        "bezeichnung": "Kartographie und Gestaltung: ",
                        "url": "http://www.geoinfo.hamburg.de/",
                        "alias": "Landesbetrieb Geoinformation und Vermessung",
                        "alias_mobil": "LGV Hamburg"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://www.hamburg.de/bsu/timonline",
                        "alias": "Kartenunstimmigkeit"
                    }
                ]
            },
            quickHelp: true,
            allowParametricURL: true,
            view: {
                center: [565874, 5934140]
            },
            proxyURL: "/cgi-bin/proxy.cgi",
            namedProjections: [
            // ETRS89 UTM
                ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
            ],
            layerConf: "../node_modules/lgv-config/services-internet.json",
            restConf: "../node_modules/lgv-config/rest-services-internet.json",
            styleConf: "../node_modules/lgv-config/style.json",
            isMenubarVisible: true,
            gemarkungen: "../node_modules/lgv-config/gemarkung.json",
            print: {
                printID: "99999",
                title: "Geo-Online",
                gfi: false
            }
        };

    return config;
});
