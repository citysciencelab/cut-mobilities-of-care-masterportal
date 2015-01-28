/*global define*/
define(function () {

    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
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
            {id: '352', visible: true, style: '352', clusterDistance: 30, styleField :'Kategorie'},
            {id: '353', visible: true, style: '353', clusterDistance: 30, styleField :'Kategorie'},
            {id: '354', visible: true, style: '354', clusterDistance: 30, styleField :'Kategorie'},
            {id: '355', visible: true, style: '355', clusterDistance: 30, styleField :'Kategorie'},
            {id: '356', visible: true, style: '356', clusterDistance: 30, styleField :'Kategorie'},
            {id: '357', visible: true, style: '357', clusterDistance: 30, styleField :'Kategorie'},
            {id: '358', visible: true, style: '358', clusterDistance: 30, styleField :'Kategorie'},
            {id: '359', visible: true, style: '359', clusterDistance: 30, styleField :'Kategorie'},
            {id: '566', visible: true}
        ],
        styleConf: '../../style.json',
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
                if (window.location.host === "wscd0096" || window.location.host === "wscd0095") {
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
                if (window.location.host === "wscd0096" || window.location.host === "wscd0095") {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return locations.host + "/mapfish_print_2.0/";
                }
            },
            title: 'Geotourismus',
            gfi: false
        },
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
