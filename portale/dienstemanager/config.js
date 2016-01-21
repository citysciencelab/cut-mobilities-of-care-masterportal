define(function () {
    var config = {
        allowParametricURL: true,
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "8", visible: false}
            ]
        },
        view: {
            center: [565874, 5934140] // Rathausmark
        },
        layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        mouseHover: false,
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
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
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
            }
        },
        orientation: true,
        poi: false,
        print: {
            printID: "99999",
            title: "Hamburg",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    }
    return config;
});
