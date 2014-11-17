/*global define*/
define(function () {

    var config = {
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
        layerIDs: [
            '94',
            '352',
            '353',
            '354',
            '355',
            '356',
            '357',
            '358',
            '359'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '94',
            '352',
            '353',
            '354',
            '355',
            '356',
            '357',
            '358',
            '359'
        ],
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '352', style: ['5','6','7','8','352_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '353', style: ['32','33','34','35','353_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '354', style: ['10','354_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '355', style: ['11','12','13','14','15','16','17','355_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '356', style: ['9','10','356_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '357', style: ['18','19','20','21','22','357_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '358', style: ['23','24','25','26','27','28','358_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '359', style: ['29','30','31','359_cluster'], clusterDistance: 30, styleField :'Kategorie'}
        ],
        menubar: true,
        isMenubarVisible: false,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: false,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: false,
            print: false,
            coord: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
