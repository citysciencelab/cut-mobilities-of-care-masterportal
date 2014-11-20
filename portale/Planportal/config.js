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
            '8',
            '453',
            '5689',
            '1346',
            '1347',
            '1205'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '453',
            '1347'
        ],
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '9999', style: '1', clusterDistance: 0, searchField: 'name', mouseHoverField: 'name',
             filterOptions: [
                 {
                     'fieldName': 'geburtsklinik',
                     'filterType': 'combo',
                     'filterString': ['*','Perinatalzentrum Level 1','Perinatalzentrum Level 2','Perinataler Schwerpunkt','Geburtsklinik','nein']
                 },
                 {
                     'fieldName': 'teilnahme_notversorgung',
                     'filterType': 'combo',
                     'filterString': ['*','ja','eingeschränkt','nein']
                 }
             ]
            }
        ],
        menubar: true,
        mouseHover: false,
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
            legend: false
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi'
    }

    return config;
});
