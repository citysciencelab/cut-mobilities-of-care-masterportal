define(function () {
    var config = {
        tree: {
            active: true,
            orderBy: "opendata",
            layerAttribute: "kategorieOpendata",
            groupLayerByID: ["DC71F8A1-7A8C-488C-AC99-23776FA7775E"],
            // categoryConf: locations.baseUrl + '../category.json'
            // groupLayerByID: ["DFDA2969-A041-433B-BD65-4CDA9F830A55","38575F13-7FA2-4F26-973F-EDED24D937E5", "757A328B-415C-4E5A-A696-353ABDC80419", "335B680C-CA3E-4FE9-BC05-641BA565E366", "DC71F8A1-7A8C-488C-AC99-23776FA7775E", "3EE8938B-FF9E-467B-AAA2-8534BB505580","19A39B3A-2D9E-4805-A5E6-56A5CA3EC8CB"]
        },
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 15.874991427504629,
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + '../diensteapiFHHNET_16012015.json',
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            // NOTE wenn displayInTree auf false steht, ist auch keine GFI-Abfrage möglich
            {id: '5182', visible: false, styles: "strassenbaumkataster_grau", displayInTree: false},
            {id: '5182', visible: false, styles: "strassenbaumkataster"},
            {id: '5183', visible: false, displayInTree: false}
        ],
        styleConf: locations.baseUrl + '../style.json',
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: false
        },
        startUpModul: '',
        // gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        searchBar: {
            placeholder: "Suche Ort, Flurstück oder Thema",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return locations.host + "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        print: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return "http://geoportal-hamburg.de/mapfish_print_2.0/";
                }
            }
        },
        proxyURL: '/cgi-bin/proxy.cgi',
    }
    return config;
});
