define(function () {
    var config = {
        title: "Geoportal der Metropolregion Hamurg",
        tree: {
            custom:false,
            orderBy: "opendata",
            filter: true,
            layerIDsForMerge: [],

            metaIDsForMerge:[]
        },
        baseLayer: [
            {id: "0", visible: true},       //WebAtlas
            {id: "1", visible: false},       //WebAtlas_grau
            {id: "2", visible: false},      //Luftbilder
            {id: "4", visible: false}       //1:5000
        ],
        footer: true,
        quickHelp: true,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            //extent:[],
            resolution: 66.145965625264583
        },
        layerConf: "../components/lgv-config/services-mrh.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "Geoportal GDI-MRH",
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
            placeholder: "Suchen nach Adresse, Thema",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: true,
            orientation: false,
            active: "gfi"
        },
        print: {
            printID: "99997",
            title: "Geoportal der Metropolregion Hamburg",
            outputFilename: "Ausdruck Geoportal GDI-MRH",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
