define(function () {

    var config = {
        wfsImgPath: "..components/lgv-config/img",
        allowParametricURL: true,
        tree: {
            custom: true,
            filter: false,            
            orderBy: "architekten",
            customConfig: "../components/lgv-config/tree-config/architekten.json"
        },
          baseLayer: [
            {id: "453", visibility: true},      //stadtplan
            {id: "452", visibility: false}     //luftbilder
            //{id: "713", visibility: false},     //geobasisikarte s-w
            //{id: "717", visibility: false},     //geobasiskarte farbig
            //{id: "1043", visibility: false},    //geobasiskarte g-b
            //{id: "368", visibility: false},     //alkis farbig
            //{id: "149", visibility: false}     //alkis g-b
                     ],
        controls: {
            zoom: true,
            toggleMenu: true
        },
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",

        print: {
            printID: "99999",
            title: "Architekten-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        menubar: true,
        mouseHover: true,
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
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Thema",
            gazetteerURL: function () {
                return "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi"
        },
        orientation: false,
        poi: false
    };

    return config;
});
