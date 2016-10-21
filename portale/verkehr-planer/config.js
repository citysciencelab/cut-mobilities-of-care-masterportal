define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        title: "Geoportal-Verkehr",
        wfsImgPath: "..components/lgv-config/img",
        allowParametricURL: true,
        view: {
            background: "white"
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        print: {
            printID: "99999",
            title: "Planerportal-Verkehr",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        mouseHover: true,
        scaleLine: true,
        customModules: ["../portale/verkehr-planer/verkehrsfunctions"],
        startUpModul: "",
        gemarkungen: "../components/lgv-config/gemarkung.json",
        
   };

   return config;
});
