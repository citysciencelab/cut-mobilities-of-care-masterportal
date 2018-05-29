/*global define*/
define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        tree: {
            type: "light"
        },
        wfsImgPath: "../node_modules/lgv-config/img/",
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        namedProjections: [
        // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        layerConf: "../node_modules/lgv-config/services-fhhnet.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../node_modules/lgv-config/category.json",
        styleConf: "../node_modules/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: false
        },
        attributions: false,
        allowParametricURL: true,
        quickHelp: false,
        // menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        // menu: {
        //     viewerName: "GeoViewer",
        //     searchBar: true,
        //     layerTree: true,
        //     helpButton: false,
        //     featureLister: 0,
        //     contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
        //     tools: true,
        //     treeFilter: false,
        //     wfsFeatureFilter: true,
        //     legend: false,
        //     routing: false
        // },
        // menuItems: {
        //     tree: {
        //         title: "Themen",
        //         glyphicon: "glyphicon-list"
        //     },
        //     tools: {
        //         title: "Werkzeuge",
        //         glyphicon: "glyphicon-wrench"
        //     },
        //     contact: {
        //         title: "Kontakt",
        //         glyphicon: "glyphicon-envelope",
        //         email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
        //     }
            // featureLister: {
            //     title: "Liste",
            //     glyphicon: "glyphicon-plus",
            //     lister: 20
            // },
            // wfsFeatureFilter: {
            //     title: "Filter öffnen",
            //     glyphicon: "glyphicon-filter"
            // }
        // },
        print: {
            printID: "99999",
            title: "Krankenhäuser in Hamburg",
            gfi: true
        }
        // tools: {
        //     gfi: {
        //         title: "Informationen abfragen",
        //         glyphicon: "glyphicon-info-sign",
        //         isActive: true
        //     }
        // }
    };

    return config;
});
