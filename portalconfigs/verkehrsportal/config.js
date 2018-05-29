define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        gfiWindow: "detached",
        wfsImgPath: "/lgv-config/img/",
        view: {
            center: [561210, 5932600] // Elbtunnel
        },
        layerConf: "../node_modules/lgv-config/services-internet.json",
        restConf: "../node_modules/lgv-config/rest-services-internet.json",
        styleConf: "../node_modules/lgv-config/style_v2.json",
        clickCounter: {
            desktop: "https://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobile: "https://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
        },
        print: {
            printID: "99999",
            title: "Ausdruck aus dem Geoportal-Verkehr",
            gfi: false
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        proxyURL: "/cgi-bin/proxy.cgi",
        mouseHover: true,
        scaleLine: true,
        customModules: ["../portalconfigs/verkehrsportal/verkehrsfunctions"]
    };

    return config;
});
