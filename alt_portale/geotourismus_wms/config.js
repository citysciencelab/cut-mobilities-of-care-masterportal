/*global define*/
define(function () {

    var config = {
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        controls: {
            zoom: false,
            toggleMenu: false,
            orientation: false,
            poi: false
        },
        footer: true,
        quickHelp: true,
        layerConf: "../services-geotourismus.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            layer: [
                {id: "99999", visibility: true},
                {id: "8999", visible: true},
                {id: "8998", visible: true},
                {id: "8997", visible: true},
                {id: "8996", visible: true},
                {id: "8995", visible: true},
                {id: "8994", visible: true},
                {id: "8993", visible: true},
                {id: "8992", visible: true}
            ]
        },
        menubar: true,
        scaleLine: true,
        isMenubarVisible: false,
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
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: false
            }
        }
    };

    return config;
});
