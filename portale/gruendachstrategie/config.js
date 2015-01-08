/*global define*/
define(function () {

    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 26.458319045841044, // // 1:100.000
            scale: 100000 // für print.js benötigt
        },
        layerConf: locations.master + '/diensteapiINTERNET.json',
        styleConf: locations.master + '/style.json',
        printURL: locations.host + ':8680/mapfish_print_2.0/',
        proxyURL: '/cgi-bin/proxy.cgi',
        printTitle: 'Gründach-Strategie',
        gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        layerIDs: [
            {id: '453', visible: true},
            {id: '94', visible: false},
            {id: '2013', visible: true, opacity: 50}
        ],
        styleConf: '../../style.json',
        menubar: true,
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
            legend: true
        },
        searchBar: {
            placeholder: "Suche Adresse, B-Plan"
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
