define(function () {
    var config = {
        title: "Geoportal MRH",
        logo: "../img/Logo_MRH_93x36.png",
        logoLink: "http://metropolregion.hamburg.de/",
        logoTooltip: "Metropolregion Hamburg",
        tree: {
            type: "custom",
            customConfig: "../components/lgv-config/tree-config/geoportal-mrh.json",
            saveSelection: true,
            baseLayer: [
                {id: "51", visibility: true}, // WebAtlas
                {id: "53", visibility: false}, // WebAtlas_grau
                {id: "55", visibility: false}, // Luftbilder
                {id: "57", visibility: false} // 1:5000
            ],
            layerIDsToStyle: [
                {
                    "id": "223",
                    "styles": "geofox_stations",
                    "name": "HVV-Haltestellen",
                    "legendURL": "http://87.106.16.168/legende_mrh/hvv-bus.png"
                },
                {
                    "id": "221",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["HVV-Fährverbindungen", "HVV-Bahnlinien", "HVV-Buslinien", "HVV-Busliniennummern"],
                    "legendURL": ["http://87.106.16.168/legende_mrh/hvv-faehre.png", "http://87.106.16.168/legende_mrh/hvv-bahn.png", "http://87.106.16.168/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            mousePosition: true,
            orientation: "allways"
        },
        simpleMap: true,
        feature_count: [
            {
                id: 73,
                count: 10
            },
			{
                id: 77,
                count: 10
            },
			{
                id: 79,
                count: 10
            },
			{
                id: 81,
                count: 10
            },
			{
                id: 83,
                count: 10
            },
			{
                id: 85,
                count: 10
            },
			{
                id: 87,
                count: 10
            },
			{
                id: 89,
                count: 10
            },
			{
                id: 91,
                count: 10
            },
			{
                id: 93,
                count: 10
            },
			{
                id: 95,
                count: 10
            },
			{
                id: 97,
                count: 10
            },
			{
                id: 99,
                count: 100
            },
			{
                id: 101,
                count: 10
            },
			{
                id: 103,
                count: 10
            },
			{
                id: 105,
                count: 10
            },
            {
                id: 303,
                count: 10
            },
            {
                id: 301,
                count: 10
            },
            {
                id: 293,
                count: 10
            }
        ],
        attributions: true,
        footer: {
            visibility: true,
            urls: [
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/kontakte.htm",
                        "alias": "Kontakte",
                        "alias_mobil": "Kontakte"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/copyright.htm",
                        "alias": "Copyright",
                        "alias_mobil": "Copyright"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/links.htm",
                        "alias": "Linkliste",
                        "alias_mobil": "Linkliste"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/index.html",
                        "alias": "zum alten Portal",
                        "alias_mobil": "zum alten Portal"
                    }
            ]
        },
        quickHelp: false,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769], // extent aus altem portal erzeugt fehler im webatlas und suchdienst
            resolution: 152.87436231907702,
            options: [
                {
                    resolution: 611.4974492763076,
                    scale: "2311167",
                    zoomLevel: 0
                },
                {
                    resolution: 305.7487246381551,
                    scale: "1155583",
                    zoomLevel: 1
                },
                {
                    resolution: 152.87436231907702,
                    scale: "577791",
                    zoomLevel: 2
                },
                {
                    resolution: 76.43718115953851,
                    scale: "288896",
                    zoomLevel: 3
                },
                {
                    resolution: 38.21859057976939,
                    scale: "144448",
                    zoomLevel: 4
                },
                {
                    resolution: 19.109295289884642,
                    scale: "72223",
                    zoomLevel: 5
                },
                {
                    resolution: 9.554647644942321,
                    scale: "36112",
                    zoomLevel: 6
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "18056",
                    zoomLevel: 7
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "9028",
                    zoomLevel: 8
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "4514",
                    zoomLevel: 9
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "2257",
                    zoomLevel: 10
                }
            ]
        },
        layerConf: "../components/lgv-config/services-mrh.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "Geoportal GDI-MRH",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: true
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suchen nach Adresse, Thema",
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            tree: {
                minChars: 3
            },
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
            },
            searchByCoord: {
               title: "Koordinatensuche",
               glyphicon: "glyphicon-search"
            }
        },
        print: {
            printID: "99999",
            title: "Geoportal der Metropolregion Hamburg",
            outputFilename: "Ausdruck Geoportal GDI-MRH",
            gfi: false,
            configYAML: "gdimrh"
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
