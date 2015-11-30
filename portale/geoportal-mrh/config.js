define(function () {
    var config = {
        title: "Geoportal der Metropolregion Hamburg",
        logo: "../img/Logo_MRH_93x36.png",
        logoLink: "http://metropolregion.hamburg.de/",
        logoTooltip: "Metropolregion Hamburg",
        tree: {
            type: "custom",
            customConfig: "../components/lgv-config/tree-config/geoportal-mrh.json",
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
                    "name": "HVV-Haltestellen"
                },
                {
                    "id": "221",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["HVV-Fährverbindungen", "HVV-Bahnlinien", "HVV-Buslinien", "HVV-Busliniennummern"]
                }
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true
        },
        footer: false,
        quickHelp: false,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769], // extent aus altem portal erzeugt fehler im webatlas und suchdienst
            resolution: 152.87436231907702,
            options: [
                {
                    resolution: 152.87436231907702,
                    scale: "250000",
                    zoomLevel: 1
                },
                {
                    resolution: 76.43718115953851,
                    scale: "100000",
                    zoomLevel: 2
                },
                {
                    resolution: 38.21859057976939,
                    scale: "60000",
                    zoomLevel: 3
                },
                {
                    resolution: 19.109295289884642,
                    scale: "40000",
                    zoomLevel: 4
                },
                {
                    resolution: 9.554647644942321,
                    scale: "20000",
                    zoomLevel: 5
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "10000",
                    zoomLevel: 6
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "5000",
                    zoomLevel: 7
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "2500",
                    zoomLevel: 8
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "1000",
                    zoomLevel: 9
                }
            ]
        },
        layerConf: "../components/lgv-config/services-mrh.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
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
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch"
            },
            tree: {
                minChars: 3
            },
            geoLocateHit: true
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            draw: true,
            record: false,
            orientation: false,
            active: "gfi"
        },
        print: {
            printID: "99999",
            title: "Geoportal der Metropolregion Hamburg",
            outputFilename: "Ausdruck Geoportal GDI-MRH",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
