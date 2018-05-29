define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        allowParametricURL: true,
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: '../node_modules/lgv-config/services-fhhnet.json',
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        categoryConf: '../node_modules/lgv-config/category.json',
        layerIDs:
        [
        {id: "453", visible: true},
        {id: "94", visible: false},
        {id: "1554", visible: false, minScale: "10000"},
        {id: "1555", visible: false, minScale: "10000"},
        {id: "1519", visible: false, minScale: "10000"},
        // {id: "1703", visible: false},
        {id: "1568,1569,1570", visible: false, name: "Schutzwürdige Böden", minScale: "10000"},
        {id: "1702", visible: true}
        ],
        styleConf: "../node_modules/lgv-config/style.json",
        menubar: true,
        mouseHover: false,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: true,
            active: "gfi"
        },
        orientation: true,
        poi: false,
        print: {
            printID: "99999",
            title: "Bodenschutz-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    }
    return config;
});
