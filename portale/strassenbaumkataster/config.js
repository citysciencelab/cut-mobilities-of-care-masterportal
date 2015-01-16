define(function () {
    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916638091682096,
            scale: 20000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET_16012015.json',
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            // NOTE wenn displayInTree auf false steht, ist auch keine GFI-Abfrage möglich
            {id: '5182', visible: false, styles: "strassenbaumkataster_grau", displayInTree: false},
            {id: '5182', visible: false, styles: "strassenbaumkataster"},
            {id: '5183', visible: false, displayInTree: false}
        ],
        styleConf: '../../style.json',
        menubar: true,
        scaleLine: false,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: false,
            legend: false,
            routing: false
        },
        // gazetteerURL: locations.host + '/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
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
        bPlanURL: 'http://geofos.fhhnet.stadt.hamburg.de/fachdaten_public/services/wfs_hh_bebauungsplaene?request=GetFeature&service=WFS&version=2.0.0',
        tools: {
            gfi: true,
            measure: false,
            print: true,
            coord: true,
            orientation: false,
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
            title: 'Straßenbaumkataster',
            gfi: true
        },
        proxyURL: '/cgi-bin/proxy.cgi',
    }

    return config;
});
