define(function () {
    console.log(locations);
    var config = {
        allowParametricURL: true,
        view: {
            center: [561210, 5932600],
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.master + '/diensteapiFHHNET.json',
        styleConf: locations.master + '/style.json',
        printURL: locations.host + ':8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: '/cgi-bin/proxy.cgi',
        gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
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
            {id: '47', visible: false, style: '47', clusterDistance: 0, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: 'id_kost'},
            {id: '45', visible: false, style: '45', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '51', visible: false, style: '51', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
//            {id: '52', visible: false, style: '52', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '1363', visible: false},
            {id: '48', visible: false, style: '48', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '50', visible: false, style: '50', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '53', visible: false, style: '53', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''}
        ],
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
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        orientation: true,
        poi: true
    }

    return config;
});
