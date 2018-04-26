define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        mouseHover: {
            show: true,
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
        styleConf: "../../node_modules/lgv-config/style_v2.json",
        namedProjections: [
            ["EPSG:31461", "+title=Gauß 3° Bessel +proj=tmerc +lat_0=0 +lon_0=3 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:31462", "+title=Gauß 6° Bessel +proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"]
        ],
        tree: {
            orderBy: "opendata",
            saveSelection: true,
            layerIDsToIgnore: [
                "1731"
            ],
            layerIDsToStyle: [
                {
                    "id": "1933",
                    "styles": "geofox_stations",
                    "name": "Haltestellen",
                    "legendURL": "http://87.106.16.168/legende_mrh/hvv-bus.png"
                }
            ],
            metaIDsToMerge: [
                "C1AC42B2-C104-45B8-91F9-DA14C3C88A1F"
            ],
            metaIDsToIgnore: [
                "9329C2CB-4552-4780-B343-0CC847538896"
            ]
        },
        layerConf: "resources/testServices.json",
        styleConf: "../node_modules/lgv-config/style.json"
    };

    return config;
});
