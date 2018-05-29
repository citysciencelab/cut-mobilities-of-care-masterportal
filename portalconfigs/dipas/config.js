define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        gfiWindow: "detached",
        simpleMap: false,
        //wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        postMessageUrl: "http://localhost:8080",
        namedProjections: [
            // GK DHDN
            ["EPSG:31461", "+title=Gauß 3° Bessel +proj=tmerc +lat_0=0 +lon_0=3 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31462", "+title=Gauß 6° Bessel +proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31463", "+title=Gauß 9° Bessel +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31464", "+title=Gauß 12° Bessel +proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31465", "+title=Gauß 15° Bessel +proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31466", "+title=Gauß-Krüger 6° Bessel +proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31467", "+title=Gauß-Krüger 9° Bessel +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31468", "+title=Gauß-Krüger 12° Bessel +proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            // ETRS89 UTM
            ["EPSG:25831", "+title=ETRS89/UTM 31N +proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
            ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
            ["EPSG:25833", "+title=ETRS89/UTM 33N +proj=utm +zone=33 +ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs"],
            // Soldner Berlin
            ["EPSG:3068", "+title=Soldner Berlin +proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            // Pulkovo
            ["EPSG:4178", "+proj=longlat +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +no_defs"],
            // Organisations
            ["SR-ORG:95", "+proj=merc +lon_0=0 +lat_ts=0 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +units=m +no_defs"],
            // WGS84
            ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
        quickHelp: true,
        portalConf: "../dipas/config.json",
        layerConf: "../portalconfigs/dipas/dipas_services.json",
        restConf: "../node_modules/lgv-config/rest-services-internet.json",
        styleConf: "../portalconfigs/dipas/beitraege_style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        uiStyle: "table",
        scaleLine: true,
        mouseHover: {
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
        isMenubarVisible: true,
        geoAPI: false,
        clickCounter: {}
    };

    return config;
});
