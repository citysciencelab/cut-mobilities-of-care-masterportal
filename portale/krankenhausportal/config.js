/*global define*/
define(function () {

    var config = {
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiINTERNET.json'),
        styleConf: locations.baseUrl + '../style.json',
        proxyURL: '/cgi-bin/proxy.cgi',
        layerIDs: [
            {id: '453', visible: true},
            {id: '452', visible: false},
            {id: '1711', visible: true, style: '1711', clusterDistance: 0, searchField: 'name', mouseHoverField: 'name',
             attribution: '<strong><a href="http://www.tagesschau.de/" target="_blank">Weitere Informationen</a></strong>',
             displayInTree: true,
             filterOptions: [
                 {
                     'fieldName': 'teilnahme_geburtsklinik',
                     'filterType': 'combo',
                     'filterName': 'Geburtsklinik',
                     'filterString': ['*','ja','nein']
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
        attributions: false,
        menubar: true,
        scaleLine: true,
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
            legend: false,
            routing: false
        },
        startUpModul: '',
        searchBar: {
            placeholder: "Suche nach Straße oder Krankenhausname",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return locations.host + "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
            }
        },
        print: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return "http://geoportal-hamburg.de/mapfish_print_2.0/";
                }
            },
            title: 'Krankenhausportal',
            gfi: false
        },
        tools: {
            gfi: true,
            measure: false,
            print: false,
            draw: false,
            coord: false,
            orientation: false,
            active: 'gfi'
        }
    }
    return config;
});
