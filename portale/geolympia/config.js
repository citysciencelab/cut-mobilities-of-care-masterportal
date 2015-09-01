define(function () {
    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916638091682096,
            scale: 20000 // für print.js benötigt
        },
        layerConf: "../components/lgv-config/services-fhhnet-olympia.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        layerIDs: [
            {id: "453", visible: true},
            {id: "452", visible: false},
            {id: "1", visible: true},
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
            {id: "7995", visible: false},
            {id: "7996", visible: false},
            {id: "7999", visible: true},
            {id: "2403", visible: false, style: "51", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
            {id:
             [
                 {
                     id: "4"
                 },
                 {
                     id: "3"
                 }
             ],
             name: "Nachnutzung", visible: false
            },
            {id:
             [
                 {
                     id: "2"
                 },
                 {
                     id: "3"
                 }
             ],
             name: "Sportstätte", visible: true
            },
            {id: "7797", visible: false, style: "7797", styleField: "piktogramm", clusterDistance: 60, mouseHoverField: "piktogramm"},
            {id: "7798", visible: true, style: "7798", styleField: "piktogramm", clusterDistance: 50, mouseHoverField: "piktogramm"}
        ],
        menubar: true,
        scaleLine: true,
        mouseHover: true,
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
            placeholder: "Suche Adresse, Sportarten",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            },
            getFeatures: [
                {
                    url: "/geofos/fachdaten_public/services/wfs_hh_olympiastandorte?service=WFS&request=GetFeature&version=2.0.0",
                    typeName: "olympia_sportarten_paralympic",
                    propertyName: "staette,art,piktogramm,geom",
                    filter: "paralympia"
                },
                {
                    url: "/geofos/fachdaten_public/services/wfs_hh_olympiastandorte?service=WFS&request=GetFeature&version=2.0.0",
                    typeName: "olympia_sportarten",
                    propertyName: "staette,art,piktogramm,geom",
                    filter: "olympia"
                }
            ]
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
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
