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
            {id: '9999', visible: false},
            {id: '1346', visible: true},
            {id: '358', visible: false},
            {id: '359', visible: false}
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
            },
            {layer: '358', style: ['23','24','25','26','27','28','358_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {layer: '359', style: ['29','30','31','359_cluster'], clusterDistance: 30, styleField :'Kategorie'}
        ],
        menubar: true,
        mouseHover: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: true,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: true,
            legend: true
        },
//        treeFilter: {
//            layer: '7777',
//            styleName: 'treefilter',
//            pathToSLD: 'http://wscd0096/master_sd/xml/treeFilterSLD.xml'
//        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
