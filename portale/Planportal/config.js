define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiINTERNET.json'),
        layerIDs:
        [
        {id: "453", visible: true},
        {id: "94", visible: false, name: "Luftbilder"},
        {id: "1392", visible: false},
        {id: "1750", visible: false},
        // {id: "522,521,523,524,525,526,527,528,529,530,531,532,533,534,535,536", visible: false},
        {id: "1747", visible: false, name: "Flächennutzungsplan (FNP) ab 1:10000"},
        // {id: "551,550,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567", visible: false, name: "Flächennutzungsplan (FNP) ab 1:10000"},
        {id: "2042", visible: false},
        // {id: "1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163", visible: false, name: "Landschaftsprogramm"},
        {id: "1749", visible: false, name: "Landschaftsprogramm"},
        {id: "2117", visible: false},
        {id: "1748", visible: false},
        // {id: "1409,1410,1411,1412,1413,1414,1415,1416", visible: false},
        {id: "433,434", visible: false, name: "Soziale Erhaltungsverordnungen"},
        {id: "1205", visible: false},
        {id: "1347", visible: true},
        {id: "1346", visible: true}
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
        startUpModul: '',
        // gazetteerURL: locations.host + "/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
        searchBar: {
            placeholder: "Suche Adresse, Bebauungsplan",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return locations.host + "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
            }
        },
        bPlan: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + "/fachdaten_public/services/wfs_hh_bebauungsplaene";
                }
                else {
                    return locations.host + "/geodienste-hamburg.de/HH_WFS_Bebauungsplaene";
                }
            }
		},
        // bPlanURL: locations.host + "/fachdaten_public/services/wfs_hh_bebauungsplaene",
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
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
            title: 'Planportal',
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    }
    return config;
});
