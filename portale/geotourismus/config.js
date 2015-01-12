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
            {id: '352', visible: true, style: '352', clusterDistance: 30, styleField :'Kategorie'},
            {id: '353', visible: true, style: '353', clusterDistance: 30, styleField :'Kategorie'},
            {id: '354', visible: true, style: '354', clusterDistance: 30, styleField :'Kategorie'},
            {id: '355', visible: true, style: '355', clusterDistance: 30, styleField :'Kategorie'},
            {id: '356', visible: true, style: '356', clusterDistance: 30, styleField :'Kategorie'},
            {id: '357', visible: true, style: '357', clusterDistance: 30, styleField :'Kategorie'},
            {id: '358', visible: true, style: '358', clusterDistance: 30, styleField :'Kategorie'},
            {id: '359', visible: true, style: '359', clusterDistance: 30, styleField :'Kategorie'}
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
            url: locations.host + ":8680/mapfish_print_2.0/",
            title: 'Geotourismus',
            gfi: false
        },
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        orientation: true,
        poi: true
    }

    return config;
});
