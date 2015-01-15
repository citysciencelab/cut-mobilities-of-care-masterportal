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
            {id: '1210', visible: true},
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
             name: 'Verkehrsbelastung auf Autobahnen', visible: true
            },
            {id: '352', visible: true, style: ['5','6','7','8','352_cluster'], clusterDistance: 0, styleField :'Kategorie'},
            {id: '353', visible: true, style: ['32','33','34','35','353_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '354', visible: true, style: ['10','354_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '355', visible: true, style: ['11','12','13','14','15','16','17','355_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '356', visible: true, style: ['3', '9','356_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '357', visible: true, style: ['18','19','20','21','22','357_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '358', visible: true, style: ['23','24','25','26','27','28','358_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '359', visible: true, style: ['29','30','31','359_cluster'], clusterDistance: 30, styleField :'Kategorie'}
        ],
        styleConf: '../../style.json',
        menubar: true,
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
            legend: true
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: false,
            print: false,
            coord: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
