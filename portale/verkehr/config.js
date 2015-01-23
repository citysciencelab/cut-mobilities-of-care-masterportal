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
             name: 'aktuelle Meldungen der TBZ', visible: true
            },
            {id: '1935', visible: false, styles: "geofox-bahn", name: "HVV Bahnlinien"},
            {id:
             [
                {
                    id: '1935',
                    styles: 'geofox-bus',
                    name: "Bus1"
                },
                {
                    id: '1935',
                    styles: 'geofox_BusName',
                    name: "Bus2"
                }
             ],
             visible: false, name: 'HVV Buslinien'
            },
            {id: '1935', visible: false, styles: 'geofox_Faehre', name: "Fährverbindungen"},
            {id: '1935', visible: false, styles: 'geofox_stations', name: "HVV Stationen"},
            {id: '46', visible: false, style: '46', clusterDistance: 60, searchField: '', mouseHoverField: '', filterOptions: []},
            {id: '49', visible: false, style: '49', clusterDistance: 60, searchField: '', mouseHoverField: '', filterOptions: []},
            {id: '47', visible: false, style: '47', clusterDistance: 0, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: 'id_kost'},
            {id: '45', visible: false, style: '45', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '51', visible: false, style: '51', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '52', visible: false, style: '52', clusterDistance: 30, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: '', styleField: 'situation'},
            {id: '48', visible: false, style: '48', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '50', visible: false, style: '50', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '53', visible: false, style: '53', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''}
        ],
        attributions: true,
        menubar: true,
        scaleLine: false,
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
            legend: true,
            routing: true
        },
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
