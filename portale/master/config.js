define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            resolution: 15.874991427504629,
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.master + '/diensteapiFHHNET.json',
        styleConf: locations.master + '/style.json',
        printURL: locations.host + ':8680/mapfish_print_2.0/',
        proxyURL: '/cgi-bin/proxy.cgi',
        gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            {id: '1346', visible: true},
            {id: '358', visible: false, style: ['23','24','25','26','27','28','358_cluster'], clusterDistance: 30, styleField :'Kategorie'},
            {id: '45', visible: false, style: '45', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '359', visible: false, style: ['29','30','31','359_cluster'], clusterDistance: 30, styleField :'Kategorie'},
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
            {
                id: '1711',
                visible: false,
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
        attributions: true,
        menubar: true,
        mouseHover: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: true,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: true,
            legend: true
        },
        searchBar: {
            placeholder: "Suche Adresse, B-Plan"
        },
//        treeFilter: {
//            layer: '7777',
//            styleName: 'treefilter',
//            pathToSLD: 'http://wscd0096/master_sd/xml/treeFilterSLD.xml'
//        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            active: 'gfi'
        },
        orientation: true,
        poi: true
    }

    return config;
});
