define(function () {

    var config = {
        allowParametricURL: true,
        tree: {
            custom: true,
            filter: false,
            orderBy: "olympia"
            // groupLayerByID: ["DFDA2969-A041-433B-BD65-4CDA9F830A55","38575F13-7FA2-4F26-973F-EDED24D937E5", "757A328B-415C-4E5A-A696-353ABDC80419", "335B680C-CA3E-4FE9-BC05-641BA565E366", "DC71F8A1-7A8C-488C-AC99-23776FA7775E", "3EE8938B-FF9E-467B-AAA2-8534BB505580","19A39B3A-2D9E-4805-A5E6-56A5CA3EC8CB"]
        },
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: "../components/lgv-config/services-fhhnet-olympia.json",
        styleConf: "../components/lgv-config/style.json",
        print: {
            url: function () {
                return "http://wscd0096:8680/mapfish_print_2.0/";
            },
            title: "Olympia-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        // treeconfig:.....type of array oder object / erst json laden
        // layerIDs: layersobjects,
        // layerIDs:
        // [
        // {id: "453", visible: true},
        // {id: "94", visible: false, name: "Luftbilder"},
        // {id: "2069", visible: false, subfolder: "Schutzgebiete", kategorieOlympia: "Naturschutz"},
        // {id: "2070", visible: false, subfolder: "Schutzgebiete", kategorieOlympia: "Naturschutz"},
        // // {id: "1452", visible: true},
        // {id: "1728", visible: true, style: "1728", clusterDistance: 0, searchField: "", mouseHoverField: "name", filterOptions: [], styleLabelField: "", styleField: "eg_einstufung", name: "Badegewässer"}
        // ],
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
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
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
