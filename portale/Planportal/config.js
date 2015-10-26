define(function () {
    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        layerIDs:
        [
        {id: "453", visible: true},
        {id: "94", visible: false, name: "Luftbilder"},
        {id: "1392", visible: true},
        {id: "1750", visible: false},
        // {id: "522,521,523,524,525,526,527,528,529,530,531,532,533,534,535,536", visible: false},
        {id: "1747", visible: false, name: "Flächennutzungsplan (FNP) ab 1:10000"},
        // {id: "551,550,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567", visible: false, name: "Flächennutzungsplan (FNP) ab 1:10000"},
        {id: "2042", visible: false, name: "Änderungsübersicht zum Flächennutzungsplan"},
        // {id: "1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163", visible: false, name: "Landschaftsprogramm"},
        {id: "1749", visible: false, name: "Landschaftsprogramm"},
        {id: "2117", visible: false, name: "Änderungsübersicht zum Landschaftsprogramm"},
        // {id: "1748", visible: false}, ehemals APRO Cache
        {id: "1409,1410,1411,1412,1413,1414,1415", visible: false},
        {id: "1416", visible: false, name: "Änderungsübersicht zum Arten- und Biotopschutz"},
        {id: "433,434", visible: false, name: "Soziale Erhaltungsverordnungen"},
        {id: "1205", visible: false},
        {id: "1562", visible: true},
        {id: "1561", visible: true}
        ],
        styleConf: "../components/lgv-config/style.json",
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
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=hh_hh_planung_festgestellt&propertyName=planrecht",
                        name: "bplan"
                    },
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=imverfahren&propertyName=plan",
                        name: "bplan"
                    }
                ]
            },
            placeholder: "Suche Adresse, Bebauungsplan",
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi",
            record: false
        },
        orientation: true,
        poi: false,
        print: {
            printID: "99999",
            title: "Planportal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
