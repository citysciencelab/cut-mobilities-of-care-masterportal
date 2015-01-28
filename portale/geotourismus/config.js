/*global define*/
define(function () {

    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiInternet.json'),
        layerIDs: [
            {id: '453', visible: true},
            {id: '682', visible: true},
            {id: '550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567', visible: false},
            {id: '1210', visible: false},
            {id: '433,434', visible: true},
            {id: '1935', visible: false, styles: "geofox-bahn", name: "HVV Bahnlinien"},
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

             name: 'Verkehrsbelastung auf Autobahnen', visible: false

            },
            {id: '2056', visible: true, style: '2056', clusterDistance: 30, styleField :'kategorie'},
            {id: '353', visible: true, style: '353', clusterDistance: 30, styleField :'kategorie'},
            {id: '2059', visible: true, style: '2059', clusterDistance: 30, styleField :'kategorie'},
            {id: '2057', visible: true, style: '2057', clusterDistance: 30, styleField :'kategorie'},
            {id: '356', visible: true, style: '356', clusterDistance: 30, styleField :'kategorie'},
            {id: '2060', visible: true, style: '2060', clusterDistance: 30, styleField :'kategorie'},
            {id: '2054', visible: true, style: '2054', clusterDistance: 30, styleField :'kategorie'},
            {id: '2058', visible: true, style: '2058', clusterDistance: 30, styleField :'kategorie'},
            {id: '566', visible: true}
        ],
        styleConf: locations.baseUrl  + '../style.json',
        menubar: true,
        scaleLine: true,
        isMenubarVisible: false,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: false,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
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
            measure: false,
            print: false,
            coord: false,
            active: 'gfi'
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
            title: 'Geotourismus',
            gfi: false
        },
        proxyURL: '/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
