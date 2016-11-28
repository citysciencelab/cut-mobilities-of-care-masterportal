define(function () {

    var config = {

        tree: {
            type: "light",
            saveSelection: false,
            layer: [
                {id: "39", visibility: true, legendUrl: "ignore"},
                {id: "4574", visibility: true}
            ]
        },

        simpleMap: false,

        wfsImgPath: "../components/lgv-config/img/",

        allowParametricURL: true,

        view: {
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },

        controls: {
            zoom: true,
            toggleMenu: true
        },

        customModules: [],

        quickHelp: true,

        layerConf: "../components/lgv-config/services-fhhnet.json",

        restConf: "../components/lgv-config/rest-services-fhhnet.json",

        styleConf: "../components/lgv-config/style.json",

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

        startUpModul: "",

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

        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
