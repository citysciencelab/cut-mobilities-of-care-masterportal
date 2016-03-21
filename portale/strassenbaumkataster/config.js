define(function () {
    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916638091682096
        },
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "94", visible: false},
                {id: "36", visible: true, gfiAttributes: "ignore", transparence: "50"},
                // {id: "191", visible: true, maxScale: "40000", gfiAttributes: "ignore"},
                {id: "2298", visible: false, name: "StraßenbaumkatasterG", displayInTree: false, styles: "strassenbaumkataster_grau"},
                {id: "182", visible: false, name: "Straßenbaumkataster", displayInTree: false},
                {id: "2297", visible: true, name: "Straßenbaumkataster", displayInTree: true}
            ]
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        controls: {
            zoom: true,
            toggleMenu: true
        },
        styleConf: "../components/lgv-config/style.json",
        treeConf: "../components/lgv-config/tree.json",
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: false,
            legend: false,
            routing: false
        },
        startUpModul: "",
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
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                zoomTo: true,
                isActive: true
            },
            print: {
                title: "Karte drucken",
                glyphicon: "glyphicon-print"
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            }
        },
        print: {
            printID: "99999",
            title: "Straßenbäume online",
            gfi: true
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
