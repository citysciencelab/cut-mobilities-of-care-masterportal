const Config = {
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    simpleMap: true,
    tree: {
        orderBy: "opendata",
        saveSelection: true,

        layerIDsToIgnore: [
            "1912", "1913", "1914", "1915", "1916", "1917", // UESG
            "2298", // Straßenbaumkataster cache grau
            "1791", // nachträgliche Bodenrichtwerte lagetypisch 1964
            "2627", "2628", "2629", "2630", "2631", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", // StaNord, wird bald abgeschaltet
            "2640", "2641", "2642", "2643", "2644", "2645", "2646", "2647", "2648", "2649", "2650", "2651", // StaNord, wird bald abgeschaltet
            "8713" // Layer Schulinfo
        ],
        layerIDsToStyle: [
            {
                "id": "1933",
                "styles": "geofox_stations",
                "name": "Haltestellen",
                "legendURL": "https://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png"
            },
            {
                "id": "1935",
                "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                "legendURL": ["https://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "https://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "https://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "https://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png"]
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
            "3233E124-E576-4B5D-978E-164720C4E75F", // MRH Große Verkehrsprojekte
            "24513F73-D928-450C-A334-E30037945729", // 3D Straßenbaumkataster Hamburg
            "7595A206-F07E-470D-A6C1-2F74F0B0C64E" // 3D Hamburger Hauptkirchen
        ]
    },
    scaleLine: true,

    footer: {
        visibility: true,
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "https://geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV Hamburg"
            },
            {
                "bezeichnung": "",
                "url": "https://www.hamburg.de/bsu/timonline",
                "alias": "Kartenunstimmigkeit"
            }
        ]
    },
    quickHelp: {
        imgPath: "https://geodienste.hamburg.de/lgv-config/img/"
    },
    allowParametricURL: true,
    view: {
        center: [565874, 5934140]
    },
    proxyURL: "/cgi-bin/proxy.cgi",
    namedProjections: [
        // GK DHDN
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        // ETRS89 UTM
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        // LS 320: zusammen mit Detlef Koch eingepflegt und geprüft
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        // WGS84
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    layerConf: "https://geodienste.hamburg.de/services-internet.json",
    restConf: "https://geodienste.hamburg.de/lgv-config/rest-services-internet.json",
    styleConf: "https://geodienste.hamburg.de/lgv-config/style_v2.json",
    isMenubarVisible: true,
    gemarkungen: "https://geodienste.hamburg.de/lgv-config/gemarkung.json",
    print: {
        printID: "99999",
        title: "Geo-Online",
        gfi: false
    },
    obliqueMap: true,
    cesiumParameter: {
        tileCacheSize: 20,
        enableLighting: false,
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        maximumScreenSpaceError: 2,
        fxaa: false
    },
    startingMap3D: false
};

// conditional export to make config readable by e2e tests
if (module) {
    module.exports = Config;
}
