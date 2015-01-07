/*global define*/
define(function () {

    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
        layerIDs: [
            {id: '8', visible: false},
            {id: '453', visible: true},
            {id: '1346', visible: false},
            {id: '1347', visible: true},
            {id: '1205', visible: false}
        ],
        styleConf: '../../style.json',
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
        gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        bPlanURL: 'http://geofos.fhhnet.stadt.hamburg.de/fachdaten_public/services/wfs_hh_bebauungsplaene?request=GetFeature&service=WFS&version=2.0.0',
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        printURL: locations.host + ':8680/mapfish_print_2.0/',
        proxyURL: '/cgi-bin/proxy.cgi',
    }

    return config;
});
