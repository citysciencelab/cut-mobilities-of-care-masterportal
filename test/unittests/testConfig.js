define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        mouseHover: {
            show: true,
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
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
