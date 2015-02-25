define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [561210, 5932600],
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiINTERNET.json'),
        styleConf: locations.baseUrl + '../style.json',
        print: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return "http://geoportal-hamburg.de/mapfish_print_2.0/";
                }
            },
            title: 'Verkehrsportal',
            gfi: false
        },
        proxyURL: '/cgi-bin/proxy.cgi',
        layerIDs: [
            {id: '453', visible: true},
            {id: '452', visible: false},
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
             name: 'aktuelle Meldungen der TBZ', visible: false
            },
            {id:
             [
                {
                    id: '1935',
                    name: "Bus1"
                },
                {
                    id: '1935',
                    name: "Bus2"
                }
             ],
             visible: false, name: 'HVV Buslinien', styles: ['geofox-bus', 'geofox_BusName']
            },
            {id: '1935', visible: false, styles: ['geofox_Faehre', 'geofox-bahn'], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},
            {id: '1933', visible: false, styles: 'geofox_stations', name: "HVV Haltestellen"},
            {id: '46', visible: false, style: '46', clusterDistance: 60, searchField: '', mouseHoverField: '', filterOptions: [], routable: true},
//            {id: '49', visible: true, style: '49', clusterDistance: 60, searchField: '', mouseHoverField: '', filterOptions: []},
            {id: '47', visible: false, style: '47', clusterDistance: 0, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: 'id_kost'},
            {id: '45', visible: false, style: '45', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', routable: true},
            {id: '51', visible: false, style: '51', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', routable: true},
            {id: '52', visible: false, style: '52', clusterDistance: 30, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', styleField: 'situation', routable: true},
            {id: '48', visible: false, style: '48', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', routable: true},
            {id: '50', visible: false, style: '50', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', routable: true},
            {id: '53', visible: false, style: '53', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', routable: true},
            {id: '2119', visible: false, style: '2119', clusterDistance: 0, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '2092', visible: false},
            {id: '2128', visible: false, style: '2128', clusterDistance: 0, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''}
        ],
        attributions: true,
        menubar: true,
        scaleLine: true,
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
            legend: false,
            routing: true
        },
        startUpModul: '',
        searchBar: {
            placeholder: "Adresssuche",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return "http://geodienste-hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            active: 'gfi'
        },
        orientation: true,
        poi: true
    }

    return config;
});
