/*global define*/
define(function () {

    var config = {
//        wmsLayerConf: '../wmsLayer.json',
        wmsLayerConf: 'http://wscd0096/libs/lgv/diensteapiFHHNET.json',
        wmsLayerIDs: [
            '8',
            '444'
        ],
        wfsLayerConf: '../wfsLayer.json',
        wfsLayerIDs: ['krankenhaeuser'
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
