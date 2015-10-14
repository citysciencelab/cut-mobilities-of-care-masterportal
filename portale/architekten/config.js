define(function () {

    var config = {
        wfsImgPath: "..components/lgv-config/img",
        allowParametricURL: true,
        tree: {
            custom: true,
            filter: false,
            orderBy: "architekten",
            customConfig: "../components/lgv-config/tree-config/architekten.json"
            // groupLayerByID: ["DFDA2969-A041-433B-BD65-4CDA9F830A55","38575F13-7FA2-4F26-973F-EDED24D937E5", "757A328B-415C-4E5A-A696-353ABDC80419", "335B680C-CA3E-4FE9-BC05-641BA565E366", "DC71F8A1-7A8C-488C-AC99-23776FA7775E", "3EE8938B-FF9E-467B-AAA2-8534BB505580","19A39B3A-2D9E-4805-A5E6-56A5CA3EC8CB"]
        },
          baseLayer: [
            {id: "453", visible: true},
            {id: "452", visible: false}
        ],
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        footer: true,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet-architekten.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        
        print: {
            printID: "99999",
            title: "Architekten-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        menubar: true,
        mouseHover: true,
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
        
        startUpModul: "",
        
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Thema",
            gazetteerURL: function () {
                return "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi"
        },
        orientation: true,
        poi: false
    };

    return config;
});
