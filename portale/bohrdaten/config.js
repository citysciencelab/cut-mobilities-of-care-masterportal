define(function () {

    var config = {
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        wfsImgPath: "..components/lgv-config/img",
        allowParametricURL: true,
        tree: {
            type: "custom",
            orderBy: "bohrdaten",
            customConfig: "../components/lgv-config/tree-config/bohrdaten.json",
            baseLayer: [
                {id: "453", visibility: true},
                {id: "452", visibility: false}
            ]
        },
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        print: {
            printID: "99999",
            title: "Bohrdaten-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        menubar: true,
        mouseHover: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "Bohrdatenportal",
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
            placeholder: "Suche Adresse, Thema",
            minChars: 3,
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            },
            geoLocateHit: true
        },
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-search"
            }
        }
    };

    return config;
});
