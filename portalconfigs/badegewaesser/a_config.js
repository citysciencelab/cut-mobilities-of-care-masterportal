define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            resolution: 66.14579761460263,
            extent: [442800, 5809000, 738000, 6102200]
        },
        layerConf: "../node_modules/lgv-config/services-fhhnet.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        print: {
            printID: "99997",
            title: "Badegewässer-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "94", visible: false, name: "Luftbilder"},
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
                {
                    id: "1728",
                    visible: true,
                    style: "1728", distance: "", clusterDistance: 0, searchField: "", mouseHoverField: "name", styleLabelField: "", styleField: "eg_einstufung", name: "Badegewässer"
                }
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true
        },
        menubar: true,
        mouseHover: true,
        scaleLine: true,
        isMenubarVisible: false,
        menuItems: {
            tree: {
                title: "Themen",
                glyphicon: "glyphicon-list"
            },
            tools: {
                title: "Werkzeuge",
                glyphicon: "glyphicon-wrench"
            },
            legend: {
                title: "Legende",
                glyphicon: "glyphicon-book"
            },
            contact: {
                title: "Kontakt",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true
            }
        },
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        }
    };

    return config;
});
