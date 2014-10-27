/*global define*/
define(function () {

    var config = {
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../diensteapiFHHNET.json',
        layerIDs: [
            '453',
            '8',
            '8992',
            '8993',
            '8994',
            '8995',
            '8996',
            '8997',
            '8998',
            '8999',
            '9999'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '453',
            '8992',
            '8993',
            '8994',
            '8995',
            '8996',
            '8997',
            '8998',
            '8999'
        ],
        styleConf: '../style.json',
        wfsconfig: [
            {layer: '8992', style: ['29','30','31','8992_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8993', style: ['23','24','25','26','27','28','8993_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8994', style: ['18','19','20','21','22','8994_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8995', style: ['9','3','8995_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8996', style: ['11','12','13','14','15','16','17','8996_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8997', style: ['10','8997_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8998', style: ['32','33','34','35','8998_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '8999', style: ['5','6','7','8','8999_cluster'], attributeField: 'Kategorie', clusterDistance: 30},
            {layer: '9999', style: ['1']}
        ],
        menubar: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: false,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: true
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            orientation: true,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi'
    }

    return config;
});
