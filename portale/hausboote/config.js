define(function () {

    var config = {

        allowParametricURL: true,

        view: {
            center: [565874, 5934140],// Rathausmarkt
            resolution: 15.874991427504629,// 1:60.000
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
        },

        footer: true,
        quickHelp: true,

        layerConf: "../components/lgv-config/services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",

        layerIDs: [
            {id: "453", visible: true,legendUrl: "ignore"},     //Karte
            {id: "452", visible: false},                        //Luftbild
            {id: "2426", visible: false},            //Bezirksgrenzen
             ],


        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,

        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: true,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },

        searchBar: {
            placeholder: "Suche nach Adresse, Stadtteil",
            gazetteerURL: function () {

                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            },

        },

        print: {
            printID: "99999",
            title: "Hausboote",
            gfi: false
        },

        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi"
        },

        orientation: true,

        poi: true
    };

    return config;
});
