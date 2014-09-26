/*global define*/
define(function () {

    var config = {
       layerConf: '../diensteapiFHHNET.json',
       layerIDs: [
            '453',
            '8',
            '9999'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '453',
            '9999'
        ],
        styleConf: '../style.json',
        wfsconfig: [
            {layer: '9999', style: '1', clusterDistance: 30, searchField: 'name'}
        ],
        menubar: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            active: 'gfi'
        }
    }

    return config;
});
