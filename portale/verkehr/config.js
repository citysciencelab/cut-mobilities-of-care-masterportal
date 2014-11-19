define(function () {
    var config = {
        view: {
            center: [561210, 5932600],
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
        layerIDs: [
            '453',
            '8',
            'extern1',
            'extern2',
            'extern3',
            'extern4',
            'extern5',
            '1682',
            '1358',
            '1357',
            '1688',
            '1361',
            '1363',
            '1686',
            '1359',
            '1362',
            '1364',
            '1365'
        ],
        visibleLayer: [
            '453'
        ],
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '44', style: '1', clusterDistance: 0, searchField: 'name', mouseHoverField: '', filterOptions: []}
        ],
        menubar: true,
        mouseHover: false,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: false,
            tools: false,
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
