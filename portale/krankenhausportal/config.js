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
            {id: '453', visible: true},
            {id: '8', visible: false},
            {id: '1711', visible: true}
        ],
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '1711', style: '1', clusterDistance: 0, searchField: 'name', mouseHoverField: 'name',
             filterOptions: [
                 {
                     'fieldName': 'teilnahme_geburtsklinik',
                     'filterType': 'combo',
                     'filterName': 'Geburtsklinik',
                     'filterString': ['*','nimmt teil','nimmt nicht teil']
                 },
                 {
                     'fieldName': 'teilnahme_notversorgung',
                     'filterType': 'combo',
                     'filterName': 'Not- und Unfallversorgung',
                     'filterString': ['*','ja','eingeschränkt','nein']
                 }
             ]
            }
        ],
        menubar: true,
        mouseHover: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: true,
            legend: false
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi'
    }

    return config;
});
