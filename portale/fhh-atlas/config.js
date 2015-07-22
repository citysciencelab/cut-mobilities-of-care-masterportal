define(function () {
    var config = {
        title: "FHH - Atlas",
        tree: {
            custom: false,
            orderBy: "opendata",
            filter: true,
            groupBaseLayerByID: [
                ["149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178"],
                ["368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397"]
            ],
            // "DC71F8A1-7A8C-488C-AC99-23776FA7775E"
            groupLayerByID: ["DFDA2969-A041-433B-BD65-4CDA9F830A55", "38575F13-7FA2-4F26-973F-EDED24D937E5", "757A328B-415C-4E5A-A696-353ABDC80419", "335B680C-CA3E-4FE9-BC05-641BA565E366", "3EE8938B-FF9E-467B-AAA2-8534BB505580", "19A39B3A-2D9E-4805-A5E6-56A5CA3EC8CB"]
        },
        baseLayerIDs: [
            {id: "453", visible: false},
            {id: "94", visible: false},
            {id: "368", visible: true, name: "ALKIS farbig"},
            {id: "149", visible: false, name: "ALKIS grau-blau"}
        ],
        footer: true,
        quickHelp: true,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140]
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "FHH - Atlas",
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
            placeholder: "Suche Adresse, Stadtteil, Themen",
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
            title: "Freie und Hansestadt Hamburg - Atlas",
            outputFilename: "Ausdruck FHH - Atlas",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };
    return config;
});
