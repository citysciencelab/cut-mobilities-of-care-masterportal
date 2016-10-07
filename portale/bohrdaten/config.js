define(function () {

    var config = {
        allowParametricURL: false,
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 66.14579761460263 // // 1:100.000
        },
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        namedProjections: [
            // ETRS89 UTM
                ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        scaleLine: true,
        startUpModul: "",
        print: {
            printID: "99999",
            title: "Trinkwasser",
            gfi: false
        },
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
