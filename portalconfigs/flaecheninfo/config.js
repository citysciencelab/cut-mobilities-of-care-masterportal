define(function () {
    var config = {       
        
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        
        gfiWindow: "attached",
        mouseHover: {
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],

            ["EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
        
        footer: {
            visibility: true,
            urls: [
               
                {
                    "bezeichnung": "Autor",
                    "url": "http://immobilien-lig.hamburg.de/",
                    "alias": "Landesbetrieb Immobilienmanagement und Grundvermögen (LIG)",
                    "alias_mobil": "LIG"
                },
                 {
                    "bezeichnung": "Kartographie und Technischer Betrieb: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
                    "alias_mobil": "LGV"
                }
            ]
        },
        portalConf: "../../portal/master/",
        postMessageUrl: "http://localhost:8080",
        proxyURL: "/cgi-bin/proxy.cgi",
        
        quickHelp: true,       
        scaleLine: true,
        simpleMap: false,
        
        layerConf: "../node_modules/lgv-config/services-fhhnet-ALL.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style_v2.json",
        wfsImgPath: "../node_modules/lgv-config/img"
   };

   return config;
});
