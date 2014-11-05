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
            '453',
            '8',
            //'8999',
            //'8998',
            //'8997',
            //'8996',
            //'8995',
            //'8994',
            //'8993',
            '8992'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '453',
            //'8999',
            //'8998',
            //'8997',
            //'8996',
            //'8995',
            //'8994',
            //'8993',
            '8992'
        ],
        styleConf: '../../style.json',
        wfsconfig: [
            //{layer: '8999', style: ['5','6','7','8','8999_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            //{layer: '8998', style: ['32','33','34','35','8998_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            //{layer: '8997', style: ['10','8997_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            //{layer: '8996', style: ['11','12','13','14','15','16','17','8996_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            //{layer: '8995', style: ['9','10','8995_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            //{layer: '8994', style: ['18','19','20','21','22','8994_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            //{layer: '8993', style: ['23','24','25','26','27','28','8993_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8992', style: ['29','30','31','8992_cluster'], clusterDistance: 30, attributeField :'Kategorie'}
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
            treeFilter: false
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
