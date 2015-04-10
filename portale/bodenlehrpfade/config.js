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
        {id: "94", visible: false},
        {id:
         [
            {
                id: "1935",
                name: "Bus1"
            },
            {
                id: "1935",
                name: "Bus2"
            }
         ],
         visible: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
        },
        {id: "1935", visible: false, styles: "geofox-bahn", name: "HVV Bahnlinien"},
        {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"},
        // {id: "5555", visible: false},
        {id: "5558", visible: false},
        {id: "5557", visible: false},
        {id: "5556", visible: false}
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
