define(function () {
    /**
    * @namespace config
    * @desc Beschreibung
    */
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zum img-Ordner für WFS-Styles
        */
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        tree: {
            type: "custom",
            baseLayer: [
                {id: "8", visibility: false},
                {id: "453", visibility: true},
                {id: "2425", visibility: true},
                {id: "2426", visibility: true}
            ],
            customConfig: "../node_modules/lgv-config/tree-config/fluechtling_internet.json"
        },
        controls: {
            zoom: true,
            toggleMenu: true
        },
        feature_count: [
            {
                id: 4,
                count: 5
            }
        ],
        view: {
            center: [565874, 5934140],
            resolution: 15.874991427504629
        },
        footer: false,
        quickHelp: false,
        layerConf: "../node_modules/lgv-config/services-internet.json",
        restConf: "../node_modules/lgv-config/rest-services-internet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: false,
        isMenubarVisible: true,
        menu: {
            viewerName: "Fluechtlingunterkuenfte HH",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
         searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Themen, Flurstück",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            },
            geoLocateHit: true
        },
        bPlan: {
            url: function () {
                return "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene";
            }
        },
        print: {
            printID: "99999",
            title: "",
            gfi: false
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
            }
        },
        orientation: true,
        poi: false
    };

    return config;
});
