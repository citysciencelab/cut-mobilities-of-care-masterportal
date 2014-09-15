/*global define*/
define(function () {

    var config = {
       layerConf: 'http://wscd0096/libs/lgv/diensteapiFHHNET.json',
       layerIDs: [
            '8',
            '444',
            '453',
            '582',
            '45'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: [
            '8',
            '444'
        ],
        menubar: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: true,
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
