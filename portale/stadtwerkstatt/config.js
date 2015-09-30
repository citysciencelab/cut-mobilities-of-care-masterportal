define(function () {

    var config = {

        wfsImgPath: "../components/lgv-config/img/",

        allowParametricURL: true,

        view: {
            center: [567108, 5928338], //Wilhelmsburger Insel
            extent: [454591, 5809000, 700000, 6075769],
            resolution: 15.875031750063500, //1: 60.000
            resolutions : [
                //66.145965625264583,
                26.458386250105834,
                15.875031750063500,
                10.583354500042333,
                5.2916772500211667,
                2.6458386250105834,
                1.3229193125052917,
                0.6614596562526458,
                0.2645838625010583,
                0.1322919312505292
            ],
            epsg: "EPSG:25832"
        },


        footer: true,

        quickHelp: true,

        layerConf: "../components/lgv-config/services-internet.json",

        restConf: "../components/lgv-config/rest-services-internet.json",

        styleConf: "../components/lgv-config/style.json",

        categoryConf: "../components/lgv-config/category.json",

        proxyURL: "/cgi-bin/proxy.cgi",

        layerIDs: [
            {id: "452", visible: true},                         //Luftbild
            {id: "453", visible: false, legendUrl: "ignore"},   //Stadtplan
            {id: "2486", visible: true, name: "ohne Thema"},
            {id: "2482", visible: true, name: "Wirtschaft"},
            {id: "2483", visible: true, name: "Umwelt"},
            {id: "2477", visible: true, name: "Wohnen"},
            {id: "2478", visible: true, name: "Gewerbe"},
            {id: "2479", visible: true, name: "Natur"},
            {id: "2480", visible: true, name: "Sport"},
            {id: "2481", visible: true, name: "Bildung"},
            {id: "2484", visible: true, name: "Verkehr"},
            {id: "2485", visible: true, name: "Verfahren"}

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
            placeholder: "Suche nach Adresse, Stadtteil",
            gazetteerURL: function () {
                    return "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
            }
        },

        print: {
            printID: "99999",
            title: "Zukunftsbild Elbinseln 2013",
            gfi: false
        },

        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: false,
            draw: false,
            active: "gfi"
        },

        orientation: true,

        poi: false
    };

    return config;
});
