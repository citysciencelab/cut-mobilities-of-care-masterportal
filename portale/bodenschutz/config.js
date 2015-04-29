define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + (locations.fhhnet ? "../diensteapiFHHNET.json" : "../diensteapiINTERNET.json"),
        layerIDs:
        [
        {id: "453", visible: true}, 
        {id: "1452", visible: true},
        {id: "94", visible: false},
        {id: "1554", visible: false, minScale: "10000"},
        {id: "1555", visible: false, minScale: "10000"},
        {id: "1519", visible: false, minScale: "10000"},
        // {id: "1703", visible: false},
        {id: "1568,1569,1570", visible: false, name: "Schutzwürdige Böden", minScale: "10000"},
        {id: "1702", visible: true}
        ],
        styleConf: locations.baseUrl + "../style.json",
        menubar: true,
        mouseHover: false,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
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
            measure: true,
            print: true,
            coord: true,
            draw: true,
            active: "gfi"
        },
        orientation: true,
        poi: false,
        print: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return "http://geoportal-hamburg.de/mapfish_print_2.0/";
                }
            },
            title: "Bodenschutz-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    }
    return config;
});
