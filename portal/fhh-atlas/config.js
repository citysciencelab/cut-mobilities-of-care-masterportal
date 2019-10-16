const Config = {
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
    simpleMap: true,
    tree: {
        orderBy: "opendata",
        saveSelection: true,
        layerIDsToIgnore: [
            "1912", "1913", "1914", "1915", "1916", "1917", // UESG
            "2935", // Baublöcke
            "1791", // nachträgliche Bodenrichtwerte lagetypisch 1964
            "2298", // Strassenbaumkataster grau
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
            // "757A328B-415C-4E5A-A696-353ABDC80419", // ParkraumGIS
            "4AC1B569-65AA-4FAE-A5FC-E477DFE5D303", // Großraum- und Schwertransport-Routen in Hamburg
            "3EE8938B-FF9E-467B-AAA2-8534BB505580", // Bauschutzbereich § 12 LuftVG Hamburg
            "F691CFB0-D38F-4308-B12F-1671166FF181", // Flurstücke gelb
            "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1" // Flurstücke schwarz
        ],
        metaIDsToIgnore: [
            "E70B7995-68CC-4F38-9F33-EBE72B09C5C0", // Sirenenstandorte
            "3F3929B9-0675-4AF0-A7F6-26F96BE8873C", // Bundesflächen Hamburg
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
            "98377F7D-84AB-4089-BDF1-F962B2C173CC", // Ausgleichsflächen Internet
            "DB433BD1-1640-4FBC-A879-72402BD5CFDB", // Bodenrichtwertzonen Hamburg
            "6A0D8B9D-1BBD-441B-BA5C-6159EE41EE71", // Bodenrichtwerte für Hamburg
            "3233E124-E576-4B5D-978E-164720C4E75F", // MRH Große Verkehrsprojekte
            "C628C722-79BD-4DAD-8198-84863157B052", // Hochwasser Sperr-u. Lenkstellenverzeichnis

            "CF94B536-1C25-4307-840A-A38D8D0761D4", // Außenwerbung-Stroer Eimsbüttel
            "63A9F039-389F-4CDE-9043-8C34FEED4EB1", // Außenwerbung-WallGmbH Eimsbüttel
            "B9602107-C820-402C-8652-4A7319B1ABC5", // Ausstattung Stadtgrün
            "6E7826BF-23FD-42E7-9347-D3796F0BF9F3", // Bauprogramm MR 23 Eimsbüttel
            "C0118DC8-0738-4A8C-9C34-25BA9D2E2B1B", // Bezirksrouten Eimsbüttel
            "78C416A9-E196-4AD1-9B3B-32516199D0EF", // Digitaler Grünplan 2018 Eimsbüttel
            "A35B4CC2-51B5-472E-89B4-F31844A2AC22", // Fahrgastunterstände Eimsbüttel
            "B9B711AC-66AD-48E8-A745-5A7B5E3E2BE7", // Fahrradbügel Eimsbüttel
            "19F98C9E-1AF3-40C9-AFEC-89F72D31656B", // Fahrradhäuser Eimsbüttel
            "BB36DCF9-7798-439E-9926-2B146149BDD0", // Forstflurstücke Eimsbüttel
            "320A4510-F6D0-479D-AB5C-26B7825236D7", // Gewässer II Eimsbüttel - AD-Schutz - FHHNET
            "A5F7288C-D245-4511-BDBA-4B70C9AB23B7", // Kleingärten Eimsbüttel
            "52025355-316F-4B81-AF36-622CC4AA8D6B", // Luftstationen Eimsbüttel – AD-Schutz - FHHNET
            "9991D8B0-F257-4CF4-8FD6-D27EF777A2CC", // Netzstationen Eimsbüttel
            "7105024D-E0CC-4E0F-B187-0D510899EFF2", // Paragraf 8 Hundeauslaufzone
            "15E2D9E2-1AC9-4084-B38C-70D600935351", // Paragraf 9 Fläche für geprüfte Hunde
            "3FDDE479-D5B4-47B1-87EC-3F5FDD06F780", // Postbrief- und Postablagekästen Eimsbüttel
            "0041D1E9-6508-489B-976D-C9E5A016A4D3", // QHG - Durchschnittsnote Eimsbüttel
            "BFA3C541-B6C6-43FC-BFF6-0AF8F2A097E7", // Rückhaltebecken Eimsbüttel - AD-Schutz - FHHNET
            "FF04C7AF-9BEE-4CAF-A045-378E470BAF24", // Spielgerätekataster Eimsbüttel
            "E75D18BE-BDBF-4E36-B7E2-16F2EFEB556A", // Spielplatz Zustandserfassung Eimsbüttel
            "3E84BFD1-C9B6-4FFA-8962-9431F2B5D935", // Stadtgrün Feinkartierung Eimsbüttel
            "1C90A026-2A71-45C5-9E49-2CB7DC7D7203", // Straßenschäden aus MovE (bis Mitte 2018) Eimsbüttel
            "29B68499-D275-458A-A646-AD040D0DD096", // Switchh Eimsbüttel
            "BAC2F38F-AD51-4FBF-95EE-25CCDAA1744C" // Winterdienst 2018 2019 Eimsbüttel

        ]
    },
    scaleLine: true,
    attributions: true,
    footer: {
        visibility: true,
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "https://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV Hamburg"
            },
            {
                "bezeichnung": "",
                "url": "https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                "alias": "SDP Download"
            },
            {
                "bezeichnung": "",
                "url": "https://www.hamburg.de/bsu/timonline",
                "alias": "Kartenunstimmigkeit"
            }
        ]
    },
    quickHelp: {
        imgPath: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/"
    },
    allowParametricURL: true,
    view: {
        center: [565874, 5934140]
    },

    layerConf: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/services-fhhnet.json",
    restConf: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/rest-services-fhhnet.json",
    styleConf: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/style_v2.json",
    isMenubarVisible: true,
    gemarkungen: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/gemarkung.json",
    print: {
        printID: "99999",
        title: "Freie und Hansestadt Hamburg - Atlas",
        outputFilename: "Ausdruck FHH - Atlas",
        gfi: true
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
