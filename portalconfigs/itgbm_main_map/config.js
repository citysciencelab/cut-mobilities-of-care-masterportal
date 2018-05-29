define(function () {

    var config = {
        wfsImgPath: "../node_modules/lgv-config/img",
        allowParametricURL: true,
        postMessageUrl: "https://localhost:9003",
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        layerConf: "../node_modules/lgv-config/services-fhhnet-ALL.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style_v2.json",
        print: {
            printID: "99999",
            title: "IT-GBM",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        mouseHover: true,
        scaleLine: true,
        gemarkungen: "../node_modules/lgv-config/gemarkung.json",
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH",  "GEOM"]
    };

    return config;
});
