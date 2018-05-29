define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        tree: {
            type: "light",
            saveSelection: false,
            layer: [
                {id: "39", visibility: true, legendUrl: "ignore"},
                {id: "4574", visibility: true}
            ]
        },

        simpleMap: false,

        wfsImgPath: "../node_modules/lgv-config/img/",

        allowParametricURL: true,

        view: {
           /* center: [565874, 5934140],
            epsg: "EPSG:25832"
            */
        },

        controls: {
            zoom: true,
            toggleMenu: true
        },

        customModules: [],

        quickHelp: true,

        layerConf: "../node_modules/lgv-config/services-fhhnet.json",

        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",

        styleConf: "../node_modules/lgv-config/style.json",

        proxyURL: "/cgi-bin/proxy.cgi",

        attributions: true,

        menubar: true,

        scaleLine: true,

        mouseHover: true,

        isMenubarVisible: true,

        menu: {
            helpButton: false,
            searchBar: true,
            layerTree: true,
            contactButton: {on: false, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: false,
            featureLister: false,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
        },

        searchBar: {
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                suggestCount:10,
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            placeholder: "Suche nach Adresse"
        },
        print: {
            printID: "99999",
            title: "Master",
            gfi: false
        },

        geoAPI: false,

        clickCounter: {},

        gemarkungen: "../node_modules/lgv-config/gemarkung.json"
    };

    return config;
});
