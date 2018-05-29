define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: "../node_modules/lgv-config/services-fhhnet.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "94", visibility: false, name: "Luftbilder"},
                {id: "2426", visibility: false},
                {id: "1750", visibility: false},
                // {id: "522,521,523,524,525,526,527,528,529,530,531,532,533,534,535,536", visibility: false},
                {id: "1747", visibility: false, name: "Flächennutzungsplan (FNP) ab 1:10000"},
                // {id: "551,550,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567", visibility: false, name: "Flächennutzungsplan (FNP) ab 1:10000"},
                {id: "2042", visibility: false, name: "Änderungsübersicht zum Flächennutzungsplan"},
                // {id: "1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163", visibility: false, name: "Landschaftsprogramm"},
                {id: "1749", visibility: false, name: "Landschaftsprogramm"},
                {id: "2117", visibility: false, name: "Änderungsübersicht zum Landschaftsprogramm"},
                // {id: "1748", visibility: false}, ehemals APRO Cache
                {id: "1409,1410,1411,1412,1413,1414,1415", visibility: false},
                {id: "1416", visibility: false, name: "Änderungsübersicht zum Arten- und Biotopschutz"},
                {id: "4445,4446", visibility: false, name: "Soziale Erhaltungsverordnungen"},
                {id: "1562", visibility: true},
                {id: "1561", visibility: true}
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true
        },
        styleConf: "../node_modules/lgv-config/style.json",
        menubar: true,
        mouseHover: false,
        scaleLine: true,
        isMenubarVisible: true,
        menuItems: {
            tree: {
                title: "Themen",
                glyphicon: "glyphicon-list"
            },
            tools: {
                title: "Werkzeuge",
                glyphicon: "glyphicon-wrench"
            },
            legend: {
                title: "Legende",
                glyphicon: "glyphicon-book"
            },
            contact: {
                title: "Kontakt",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        searchBar: {
            gazetteer: {
                url: "/geodienste_hamburg_de/HH_WFS_DOG",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true,
                minChars: 3,
            },
            specialWFS: {
                minChars: 2,
                definitions: [
                    {
                        url: "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                        data: "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_festgestellt&propertyName=planrecht",
                        name: "bplan"
                    },
                    {
                        url: "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                        data: "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_imverfahren&propertyName=plan",
                        name: "bplan"
                    }
                ]
            },
            placeholder: "Suche Adresse, Bebauungsplan",
            geoLocateHit: true,
            minChars: 2
        },
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            // print: {
            //     title: "Karte drucken",
            //     glyphicon: "glyphicon-print"
            // },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },
        print: {
            printID: "99999",
            title: "Planportal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
