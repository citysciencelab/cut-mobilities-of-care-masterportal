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
            '9999',
            '1346'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '453',
            '9999'
        ],
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '9999', style: '1', clusterDistance: 0, searchField: 'name', mouseHoverField: 'name'}
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
            treeFilter: false
        },
        treeFilter: {
            layer: '7777',
            styleName: 'treefilter',
            pathToSLD: 'http://wscd0096/master_sd/xml/treeFilterSLD.xml'
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
