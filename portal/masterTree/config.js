define(function () {

    var config = {
        animation: {
            steps: 30,
            url: "http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung",
            params: {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                TYPENAME: "app:mrh_kreise",
                VERSION: "1.1.0",
                maxFeatures: "10000"
            },
            featureType: "mrh_einpendler_gemeinde",
            attrAnzahl: "anzahl_einpendler",
            attrKreis: "wohnort_kreis",
            minPx: 5,
            maxPx: 30,
            num_kreise_to_style: 4,
            zoomlevel: 1,
            colors: ["rgba(255,0,0,0.5)", "rgba(0,255,0,0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,255,0.5)"]
        },
        clickCounter: {},
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
                    "alias_mobil": "LGV"
                }
            ]
        },
        gfiWindow: "attached",
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        layerConf: "../node_modules/lgv-config/services-fhhnet-ALL.json",
        mouseHover: {
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
        namedProjections: [
            // ETRS89 UTM
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],

            ["EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
        portalConf: "../../portal/master/",
        postMessageUrl: "http://localhost:8080",
        proxyURL: "/cgi-bin/proxy.cgi",
        quickHelp: true,
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        scaleLine: true,
        simpleMap: false,
        styleConf: "../node_modules/lgv-config/style_v2.json",
        wfsImgPath: "../node_modules/lgv-config/img",
        zoomtofeature: {
            attribute: "flaechenid",
            imglink: "../img/location_eventlotse.svg",
            layerid: "4561",
            WFSid: "4560"
        },
        startingMap3D: false
   };

   return config;
});
