define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: false,
        view: {},
        footer: false,
        layerConf: "../node_modules/lgv-config/services-fhhnet.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        scaleLine: true,
        isMenubarVisible: true,
        print: {
            printID: "99999",
            title: "Freie und Hansestadt Hamburg - Mietenspiegel",
            outputFilename: "Ausdruck Hamburger Mietenspiegel",
            gfi: true
        },
        namedProjections: [
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ]
    };

    return config;
});
