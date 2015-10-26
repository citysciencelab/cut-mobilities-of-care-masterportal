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
            // {id: "6002,6001,6000", visible: false, name: "Erreichbarkeit der Sportstätten mit dem Auto"},
            // {id: "6008,6007,6006", visible: false, name: "Erreichbarkeit der Sportstätten mit dem Rad"},
            // {id: "6005,6004,6003", visible: false, name: "Erreichbarkeit der Sportstätten zu Fuss"},
            {id:
             [
                {
                    id: "6002"
                },
                {
                    id: "6001"
                },
                {
                    id: "6000"
                }
             ],
             visible: false, name: "Erreichbarkeit der Sportstätten zu Fuss"
            },
            {id:
             [
                {
                    id: "6005"
                },
                {
                    id: "6004"
                },
                {
                    id: "6003"
                }
             ],
             visible: false, name: "Erreichbarkeit der Sportstätten mit dem Rad"
            },
            {id:
             [
                {
                    id: "6008"
                },
                {
                    id: "6007"
                },
                {
                    id: "6006"
                }
             ],
             visible: false, name: "Erreichbarkeit der Sportstätten mit dem Auto"
            },
            {id: "2092", visible: false},
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
            {id: "2403", visible: false, style: "51", clusterDistance: 40},
            {id: "52", visible: false, style: "52", clusterDistance: 30, styleField: "situation"},
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
        attributions: true,
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
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_olympiastandorte?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=olympia_sportarten_paralympic",
                        name: "paralympia"
                    },
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_olympiastandorte?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=olympia_sportarten",
                        name: "olympia"
                    }
                ]
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            draw: false,
            orientation: false,
            record: false,
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
