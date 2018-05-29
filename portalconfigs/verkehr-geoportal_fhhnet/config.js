define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        layerConf: "../node_modules/lgv-config/services-fhhnet.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style_v2.json",
        print: {
            printID: "99999",
            title: "Geoportal-Verkehr_FHHNET",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        mouseHover: true,
        scaleLine: true,
        customModules: ["../portalconfigs/verkehr-geoportal_fhhnet/verkehrsfunctions"],
        gemarkungen: "../node_modules/lgv-config/gemarkung.json"

    };

    return config;
});
