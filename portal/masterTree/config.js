define(function () {

    var config = {
       wfsImgPath: "..node_modules/lgv-config/img",
       allowParametricURL: true,
        namedProjections: [
            // ETRS89 UTM
                ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
            ],
       layerConf: "../node_modules/lgv-config/services-fhhnet-ALL.json",
       restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
       styleConf: "../node_modules/lgv-config/style.json",
       proxyURL: "/cgi-bin/proxy.cgi",
       mouseHover: true,
       scaleLine: true,
       gemarkungen: "../node_modules/lgv-config/gemarkung.json"
   };

   return config;
});
