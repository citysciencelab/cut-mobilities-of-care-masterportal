/*global define*/
define(function () {

    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: true
        },
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
                    "alias_mobil": "LGV Hamburg"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                    "alias": "SDP Download"
                },
                {
                    "bezeichnung": "",
                    "url": "http://www.hamburg.de/bsu/timonline",
                    "alias": "Kartenunstimmigkeit"
                }
            ]
        },
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            saveSelection: false,
            layer: [
                {id: "453", visible: true},
                {id: "2056", visible: true, style: "2056", clusterDistance: 30, styleField: "kategorie"},
                {id: "353", visible: true, style: "353", clusterDistance: 30, styleField: "kategorie"},
                {id: "2059", visible: true, style: "2059", clusterDistance: 30, styleField: "kategorie"},
                {id: "2057", visible: true, style: "2057", clusterDistance: 30, styleField: "kategorie"},
                {id: "356", visible: true, style: "356", clusterDistance: 30, styleField: "kategorie"},
                {id: "2060", visible: true, style: "2060", clusterDistance: 30, styleField: "kategorie"},
                {id: "2054", visible: true, style: "2054", clusterDistance: 30, styleField: "kategorie"},
                {id: "2058", visible: true, style: "2058", clusterDistance: 30, styleField: "kategorie"}
            ]
        },
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menuItems: {
            tree: {
                title: "Themen",
                glyphicon: "glyphicon-list"
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
        startUpModul: "",
        attributions: true,
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            }
        }
    };

    return config;
});
