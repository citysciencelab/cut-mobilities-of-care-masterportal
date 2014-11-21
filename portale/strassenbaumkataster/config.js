define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            resolution: 15.874991427504629,
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            {id: '7777', visible: false},
            {id: '1388', visible: false},
            {id: '1117', visible: false},
            {id: '1166', visible: false},
            {id: '5182', visible: true}
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: getVisibleLayer(),
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '8999', style: ['5','6','7','8','8999_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8998', style: ['32','33','34','35','8998_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8997', style: ['10','8997_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8996', style: ['11','12','13','14','15','16','17','8996_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8995', style: ['9','10','8995_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8994', style: ['18','19','20','21','22','8994_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8993', style: ['23','24','25','26','27','28','8993_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8992', style: ['29','30','31','8992_cluster'], clusterDistance: 30, attributeField :'Kategorie'}
        ],
        menubar: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: false,
            legend: false
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: false,
            print: true,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi'
    }

    return config;
});
