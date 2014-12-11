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
            {id:
             [
                 {
                     id: '1364',
                     attribution:
                     {
                         eventname: 'aktualisiereverkehrsnetz',
                         timeout: (10 * 60000)
                     }
                 },
                 {
                     id: '1365'
                 }
             ],
             name: 'Verkehrsbelastung auf Autobahnen', visible: true
            },
            {id: 'extern1', visible: false, styles: "geofox-bahn", name: "HVV Bahnlinien"},
            {id:
             [
                {
                    id: 'extern1',
                    styles: 'geofox-bus',
                    name: "Bus1"
                },
                {
                    id: 'extern1',
                    styles: 'geofox_BusName',
                    name: "Bus2"
                }
             ],
             visible: false, name: 'HVV Buslinien'
            },
            {id: 'extern1', visible: false, styles: 'geofox_Faehre', name: "Fährverbindungen"},
            {id: 'extern1', visible: false, styles: 'geofox_stations', name: "HVV Stationen"},
            {id: '46', visible: false, style: '46', clusterDistance: 60, searchField: '', mouseHoverField: '', filterOptions: []},
            {id: '49', visible: false, style: '49', clusterDistance: 60, searchField: '', mouseHoverField: '', filterOptions: []},
            {id: '1357', visible: false},
            {id: '47', visible: false, style: '47', clusterDistance: 0, searchField: '', mouseHoverField: '', filterOptions: []},
            {id: '943', visible: false},
            {id: '1361', visible: false},
            {id: '1363', visible: false},
            {id: '1360', visible: false},
            {id: '1359', visible: false},
            {id: '1362', visible: false}
        ],
        styleConf: '../../style.json',
        attributions: true,
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
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
