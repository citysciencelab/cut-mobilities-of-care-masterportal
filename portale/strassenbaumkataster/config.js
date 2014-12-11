define(function () {
    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916638091682096,
            scale: 20000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET_19112014.json',
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            // NOTE wenn displayInTree auf false steht, ist auch keine GFI-Abfrage möglich
            {id: '5182', visible: false, styles: "strassenbaumkataster_grau", displayInTree: false},
            {id: '5182', visible: true, styles: "strassenbaumkataster"},
            {id: '5183', visible: false, displayInTree: false},
        ],
        styleConf: '../../style.json',
        menubar: true,
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
            legend: false
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: false,
            print: true,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi',
        printTitle: 'Straßenbaumkataster'
    }

    return config;
});
