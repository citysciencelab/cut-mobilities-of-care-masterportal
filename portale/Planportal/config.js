/*global define*/
define(function () {

    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 15.874991427504629, // 1:60.000
            scale: 60000 // für print.js benötigt
        },
        layerConf: "../../diensteapiFHHNET_07012015.json",
        layerIDs:
        [
            {id: "453", visible: true},
            {id: "8", visible: false},
            {id: "521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536", visible: false},
            {id: "550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567", visible: false},
            {id: "1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163", visible: false},
            {id: "1409,1410,1411,1412,1413,1414,1415,1416", visible: false},
            {id: "433,434", visible: false},
            {id: "1205", visible: false},
            {id: "1347", visible: true},
            {id: "1346", visible: true}
        ],
        styleConf: "../../style.json",
        menubar: true,
        mouseHover: false,
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
            legend: false
        },
        gazetteerURL: locations.host + "/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
        searchBar: {
            placeholder: "Suche Adresse, B-Plan"
        },
        bPlanURL: "http://geofos.fhhnet.stadt.hamburg.de/fachdaten_public/services/wfs_hh_bebauungsplaene",
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            active: "gfi"
        },
        orientation: true,
        poi: false,
        print: {
            url: locations.host + ":8680/mapfish_print_2.0/",
            title: 'Planportal',
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
    }

    return config;
});
