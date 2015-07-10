define(function () {
    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916772500211667,
            resolutions : [
                66.145965625264583,
                26.458386250105834,
                15.875031750063500,
                10.583354500042333,
                5.2916772500211667,
                2.6458386250105834,
                1.3229193125052917,
                0.6614596562526458,
                0.2645838625010583,
                0.1322919312505292
            ]
        },
        layerConf: "../components/lgv-config/services-fhhnet-olympia.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        layerIDs: [
            {id: "453", visible: true},
            {id: "452", visible: false},
            {id: "1", visible: true},
            {id: "7999", visible: true},
            {id: "2", visible: true},
            {id: "7798", visible: true, style: "7798", styleField: "piktogramm", clusterDistance: 50}
        ],
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
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Sportarten",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            },
            getFeatures: [
                {
                    url: "/geofos/fachdaten_public/services/wfs_hh_olympiastandorte?service=WFS&request=GetFeature&version=2.0.0",
                    typeName: "olympia_komplexe",
                    propertyName: "staette,art,allenutzun,center_geom",
                    filter: "olympia"
                },
                {
                    url: "/geofos/fachdaten_public/services/wfs_hh_olympiastandorte?service=WFS&request=GetFeature&version=2.0.0",
                    typeName: "olympia_gebaeude",
                    propertyName: "staette,art,allenutzun,center_geom",
                    filter: "olympia"
                }
            ]
        },
        tools: {
            gfi: true,
            measure: false,
            print: true,
            coord: true,
            draw: false,
            orientation: false,
            active: "gfi"
        },
        print: {
            printID: "99997",
            title: "Bürgerportal Olympia",
            gfi: true
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
