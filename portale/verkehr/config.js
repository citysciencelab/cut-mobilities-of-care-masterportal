define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [561210, 5932600],
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
        styleConf: '../../style.json',
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            {id: 'extern1', visible: false, styles: "geofox-bahn"},
            {id:
             [
                {
                    id: 'extern1',
                    styles: 'geofox-bus'
                },
                {
                    id: 'extern1',
                    styles: 'geofox_BusName'
                }
             ],
             visible: false, name: 'HVV Buslinien'
            },
            {id: 'extern1', visible: false, styles: 'geofox_Faehre'},
            {id: 'extern1', visible: false, styles: 'geofox_stations'},
            {id: '937', visible: false},
            {id: '939', visible: false},
            {id: '1357', visible: false},
            {id: '943', visible: false},
            {id: '1361', visible: false},
            {id: '1363', visible: true},
            {id: '1360', visible: false},
            {id: '1359', visible: false},
            {id: '1362', visible: false},
            {id:
             [
                 {
                     id: '1364',
                 },
                 {
                     id: '1365'
                 }
             ],
             name: 'Verkehrsbelastung auf Autobahnen', visible: false
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
            contactButton: false,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true
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
