/*global define*/
define(function () {

    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiInternet.json'),
        layerIDs: [
            {id: '453', visible: false},
            {id: '682', visible: false},
            {id: '550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567', visible: false},
            {id: '1210', visible: false},
            {id: '433,434', visible: false},
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
            {id:
             [
                 {
                     id: '729'
                 },
                 {
                     id: '2008'
                 },
                 {
                     id: '552'
                 },
                 {
                     id: '1830'
                 }
             ],

             name: 'Mehrere Dienste', visible: false, opacity:"50"

            },
            {id: '2056', visible: false, style: '2056', clusterDistance: 30, styleField :'kategorie'},
            {id: '353', visible: false, style: '353', clusterDistance: 30, styleField :'kategorie'},
            {id: '2059', visible: false, style: '2059', clusterDistance: 30, styleField :'kategorie'},
            {id: '2057', visible: false, style: '2057', clusterDistance: 30, styleField :'kategorie'},
            {id: '356', visible: false, style: '356', clusterDistance: 30, styleField :'kategorie'},
            {id: '2060', visible: false, style: '2060', clusterDistance: 30, styleField :'kategorie'},
            {id: '2054', visible: false, style: '2054', clusterDistance: 30, styleField :'kategorie'},
            {id: '2058', visible: true, style: '2058', clusterDistance: 30, styleField :'kategorie', opacity:"70"},
            {id: '566', visible: false},
            {
                id: '1711',
                visible: true,
                attribution: 'Krankenhausattributierung in config',
                style: '1711',
                clusterDistance: 0,
                searchField: 'name',
                mouseHoverField: 'name',
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
        startUpModul: '',
        searchBar: {
            placeholder: "Adresssuche",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return locations.host + "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
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
