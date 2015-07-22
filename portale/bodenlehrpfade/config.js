define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [571174, 5929140], // Rathausmarkt
            resolution: 5.2916772500211667 // 1:20.000
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        // categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        layerIDs:
        [
        {id: "453", visible: true},
        {id: "94", visible: false},
        {id:
         [
            {
                id: "1935",
                name: "Bus1"
            },
            {
                id: "1935",
                name: "Bus2"
            }
         ],
         visible: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
        },
        {id: "1935", visible: false, styles: "geofox-bahn", name: "HVV Bahnlinien"},
        {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"},
        {id: "2284,2401", visible: true, name: "Lehrpfad"},
        {id: "2283,2402", visible: true, name: "Tafeln"}
        ],
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
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: true,
            active: "gfi"
        },
        orientation: true,
        poi: false,
        print: {
            printID: "99997",
            title: "Bodenschutz-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
