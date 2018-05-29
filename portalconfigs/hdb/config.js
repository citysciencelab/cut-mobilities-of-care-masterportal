define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        geoAPI: true,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: "../node_modules/lgv-config/services-internet.json",
        // layerConf: "http://87.106.67.159/lgv-config/services-internet.json",
        tree: {
            type: "light",
            layer: [
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
            {id: "1561", visible: false},
            {id: "1562", visible: false},
            {id: "682", visible: false},
            {id: "1585", visible: false, name: "Schulen"}
            // {id: "1247", visible: false, name: "Berufsschulen"},
            // {id: "1303", visible: false, name: "Hochschulen"}
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        styleConf: "../node_modules/lgv-config/style.json",
        // styleConf: "http://87.106.67.159/lgv-config/style.json",
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
        searchBar: {
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: false
            },
            placeholder: "Suche Adresse, Stadtteil",
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
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
            },
            draw: {
                title: "Zeichnen",
                glyphicon: "glyphicon-pencil"
            }
        },
        print: {
            printID: "99997",
            title: "Bodenschutz-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
