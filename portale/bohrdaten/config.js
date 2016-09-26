define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        controls: {
            zoom: true,
            toggleMenu: true,
            mousePosition: true,
            fullScreen: true,
            orientation: "once"
        },
        quickHelp: true,
        allowParametricURL: true,
        tree: {
            type: "custom"
        },
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        print: {
            printID: "99999",
            title: "Bohrdaten-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        menubar: true,
        mouseHover: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "Bohrdatenportal",
            layerTree: true,
            helpButton: false,
            contact: {
                serviceID: "80002",
                from: [{
                    email: "lgvgeoportal-hilfe@gv.hamburg.de",
                    name: "LGVGeoportalHilfe"
                }],
                to: [{
                    email: "lgvgeoportal-hilfe@gv.hamburg.de",
                    name: "LGVGeoportalHilfe"
                }],
                ccToUser: true,
                cc: [],
                bcc: [],
                subject: "",
                textPlaceholder: "",
                includeSystemInfo: true
            }
        },
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
            }
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Thema",
            minChars: 3,
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            }
        },
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-search"
            }
        }
    };

    return config;
});
