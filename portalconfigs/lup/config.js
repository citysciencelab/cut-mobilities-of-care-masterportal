define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        wfsImgPath: "/lgv-config/img/",
        allowParametricURL: true,
        view: {
            //center: [661123, 5943003],
            //extent: [605619, 5869845, 730584, 5990379],
            center: [272873, 5934567], // epsg:25833
            extent: [238961, 5890390, 325972, 5952153], // epsg:25833
            resolution: 66.14579761460263,
            resolutions: [
                132.29193125052916,
                66.145965625264583,
                26.458386250105834,
                15.875031750063500,
                10.583354500042333,
                5.2916772500211667,
                2.6458386250105834,
                1.3229193125052917,
                0.6614596562526458,
                0.2645838625010583,
                0.1322919312505292
            ],
            epsg: "EPSG:25833"
        },
        layerConf: "../node_modules/lgv-config/services-lup.json",
        categoryConf: "../node_modules/lgv-config/category.json",
        styleConf: "../node_modules/lgv-config/style.json",
        print: {
            url: function () {
                return "http://geodienste.hamburg.de/mapfish_print_2.0/";
            },
            title: "Badestellen im Landkreis",
            gfi: false
        },
        proxyURL: "../cgi-bin/proxy.cgi",
        layerIDs:
        [
		{id: "1", visible: true},
        {id: "2", visible: false},
        {id: "11", visible: false, name: "Luftbilder"},
        {id: "22", visible: false, name: "Camping (WMS)"},
        {id: "21", visible: true, name: "Badestellen (WMS)"},
        {id: "23", visible: false, style: "23", name: "Badestellen", mouseHoverField: "Bezeichnung"}
        ],
        menubar: true,
        mouseHover: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: false,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "heinz.schmidt@kreis-lup.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            draw: false,
            active: "gfi"
        },
        orientation: true,
        poi: false
    };

    return config;
});
