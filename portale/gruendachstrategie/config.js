/*global define*/
define(function () {

    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 26.458319045841044, // // 1:100.000
            scale: 100000 // für print.js benötigt
        },
        //layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiINTERNET.json'),
        layerConf: locations.baseUrl + '../diensteapiINTERNET.json',
        styleConf: locations.baseUrl + '../style.json',
        proxyURL: '/cgi-bin/proxy.cgi',
        // gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        layerIDs: [
            {id: '453', visible: true},
            {id: '94', visible: false},
            {id: '2013', visible: true, opacity: 50}
        ],
        menubar: true,
        scaleLine: false,
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
            legend: true,
            routing: false
        },
        startUpModul: '',
        searchBar: {
            placeholder: "Adresssuche",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return locations.host + "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
            }
        },
        print: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return "http://geoportal-hamburg.de/mapfish_print_2.0/";
                }
            },
            title: 'Gründachstrategie',
            gfi: false
        },
        tools: {
            gfi: false,
            measure: true,
            print: true,
            coord: true,
            active: 'gfi'
        },
        orientation: true,
        poi: false
    }

    return config;
});
