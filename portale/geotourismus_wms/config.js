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
        layerConf: "../components/lgv-config/diensteapiINTERNET.json",
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
        menu: {
            viewerName: "GeoViewer",
            searchBar: false,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
        },
        startUpModul: "",
        tools: {
            gfi: false,
            measure: false,
            print: false,
            coord: false,
            draw: false,
            record: false,
            active: "gfi"
        }
    };

    return config;
});
