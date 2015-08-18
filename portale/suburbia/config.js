define(function () {

    var config = {

        view: {
            center: [565874, 5939000],
            resolution: 66.145965625264583, // 1:250.000
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
        },

        footer: true,
        quickHelp: true,


        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",

        layerIDs: [
            {id: "453", visible: true, legendUrl: "ignore"},    //Karte
            {id: "452", visible: false},                      //Luftbild       
            {id: "1727", visible: true, name:"Kooperationsprojekte mit Hamburger Nachbargemeinden u. -kreisen"}

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
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },

        startUpModul: "",

        searchBar: {
            placeholder: "Suche nach Adresse, Stadtteil",
            gazetteerURL: function () {
                    return   "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
            }
        },

        print: {
            printID: "99999",
            title: "SUBURBIA",
            gfi: true
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

        poi: false
    };

    return config;
});
