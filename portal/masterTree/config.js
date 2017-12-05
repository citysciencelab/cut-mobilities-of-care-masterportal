define(function () {

    var config = {
       wfsImgPath: "..node_modules/lgv-config/img",
       allowParametricURL: true,
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],

            ["EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
       layerConf: "../node_modules/lgv-config/services-internet.json",
       restConf: "../node_modules/lgv-config/rest-services-internet.json",
       styleConf: "../node_modules/lgv-config/style.json",
       proxyURL: "/cgi-bin/proxy.cgi",
       mouseHover: {
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
       scaleLine: true,
       gemarkungen: "../node_modules/lgv-config/gemarkung.json"
   };

   return config;
});
