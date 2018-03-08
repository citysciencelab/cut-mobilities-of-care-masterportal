define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        mouseHover: {
            show: true,
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
        styleConf: "../node_modules/lgv-config/style.json",
        namedProjections: [
            ["EPSG:31461", "+title=Gauß 3° Bessel +proj=tmerc +lat_0=0 +lon_0=3 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31462", "+title=Gauß 6° Bessel +proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"]
        ]
    };

    return config;
});
