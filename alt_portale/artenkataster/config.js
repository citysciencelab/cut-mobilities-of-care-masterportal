define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        tree: {
            type: "light",
            saveSelection: false,
            layer: [
                {id: "453", visibility: true, legendUrl: "ignore"},
                {id: "452", visibility: false},
                {id: "1118", visibility: true,  featureCount: 100}
            ]
        },


        view: {
            zoomLevel:0
        },

        simpleMap: false,

        wfsImgPath: "../components/lgv-config/img/",

        allowParametricURL: true,



        controls: {
            zoom: true,
            toggleMenu: true
        },

        customModules: [],

        quickHelp: true,

        layerConf: "../components/lgv-config/services-internet.json",

        restConf: "../components/lgv-config/rest-services-internet.json",

        styleConf: "../components/lgv-config/style.json",

        proxyURL: "/cgi-bin/proxy.cgi",

        attributions: true,

        menubar: true,

        scaleLine: true,

        mouseHover: true,

        isMenubarVisible: true,

        menuItems: {
            tree: {
                title: "Themen",
                glyphicon: "glyphicon-list"
            },
            legend: {
                title: "Legende",
                glyphicon: "glyphicon-book"
            },
        },

        menu: {
            helpButton: false,
            searchBar: true,
            layerTree: true,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            featureLister: false,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
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
        },

        startUpModul: "",

        searchBar: {
            placeholder: "Suchen nach Adresse",
            gazetteer: {
                minChars: 3,
                url: "/geofos/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
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
        print: {
            printID: "99999",
            title: "Master",
            gfi: false
        },

        geoAPI: false,

        clickCounter: {},

        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
