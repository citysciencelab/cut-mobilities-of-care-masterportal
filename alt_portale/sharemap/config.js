define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmark
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        layerIDs:
        [
            {id: "453", visible: true},
            {id: "8", visible: false}
        ],
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
            legend: false,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        // bPlanURL: locations.host + "/fachdaten_public/services/wfs_hh_bebauungsplaene",
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi"
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
