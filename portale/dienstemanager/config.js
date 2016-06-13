define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmark
        },
        layerConf: "/lgv-config/services-fhhnet-ALL.json",
        restConf: "/lgv-config/rest-services-fhhnet.json",
         tree: {
            type: "light",
            layer: [
               {id: "453", visible: true},
               {id: "8", visible: false}
            ]
        },
        controls: {
            zoom: true
        },
        styleConf: "/lgv-config/style.json",
        menubar: true,
        mouseHover: false,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            addWMS: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        startUpModul: "",
		attributions: true,
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true
            },
            geoLocateHit: true
        },
        gemarkungen: "../components/lgv-config/gemarkung.json",
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
                title: "Zeichnen / Schreiben",
                glyphicon: "glyphicon-pencil"
            },
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-search"
            }
        },
        print: {
            printID: "99999",
            title: "Hamburg",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
