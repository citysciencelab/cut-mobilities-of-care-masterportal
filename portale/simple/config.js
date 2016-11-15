define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        allowParametricURL: true,
        attributions: true,
        isMenubarVisible: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        mouseHover: true,
        print: {
            printID: "99999",
            title: "Geoportal der Metropolregion Hamburg",
            outputFilename: "Ausdruck Geoportal GDI-MRH",
            gfi: false,
            configYAML: "gdimrh"
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        quickHelp: true,
        scaleLine: true,
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769], // extent aus altem portal erzeugt fehler im webatlas und suchdienst
            resolution: 76.43718115953851,
            options: [
                {
                    resolution: 76.43718115953851,
                    scale: "288896",
                    zoomLevel: 0
                },
                {
                    resolution: 38.21859057976939,
                    scale: "144448",
                    zoomLevel: 1
                },
                {
                    resolution: 19.109295289884642,
                    scale: "72223",
                    zoomLevel: 2
                },
                {
                    resolution: 9.554647644942321,
                    scale: "36112",
                    zoomLevel: 3
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "18056",
                    zoomLevel: 4
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "9028",
                    zoomLevel: 5
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "4514",
                    zoomLevel: 6
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "2257",
                    zoomLevel: 7
                }
            ]
        },
        wfsImgPath: "../components/lgv-config/img/"
    };

    return config;
});
