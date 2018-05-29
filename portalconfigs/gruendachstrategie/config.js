/*global define*/
define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        allowParametricURL: false,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 26.458319045841044 // // 1:100.000
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        layerConf: "../node_modules/lgv-config/services-internet.json",
        restConf: "../node_modules/lgv-config/rest-services-internet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        categoryConf: "../node_modules/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "94", visible: false},
                {id: "2013", visible: true, transparency: "50"}
            ]
        },
        menubar: true,
        scaleLine: false,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPrtal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: false,
            addWMS: false
        },
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            placeholder: "Adresssuche",
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Gründachstrategie",
            gfi: false
        },
        tools: {
            gfi: false,
            measure: true,
            print: false,
            coord: true,
            draw: false,
            record: false,
            active: "gfi"
        }
    };

    return config;
});
