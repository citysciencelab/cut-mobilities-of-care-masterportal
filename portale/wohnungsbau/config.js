define(function () {
        var config = {

  tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "1886", visible: false, name: "Bezirksgrenzen"},
                {id: "1724", visible: false, name: "Fertiggestellte Wohnungen"}, // fertiggest.whg.2013
                {id: "1530", visible: false, name: "Ausgewählte Bauprojekte"}, // wohnungsbauproj.
                {id: "1173", visible: false, name: "Genehmigte Wohnungen pro Bezirk"}, // baugen.hh
                {id: "1532", visible: true, name: "Wohnbauflächenenpotentiale"},
                {id: "2130", visible: true}, //  gef.mietw.2014
                {id: "1419", visible: true}, // gef.mietw.2013
                {id: "1418", visible: true}, // gef.mietw.2012
                {id: "1417", visible: true} // gef.mietw.2011
            ]
        },
        metadatenURL: "",
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            resolution: 66.14579761460263, // 1:250 000
            resolutions: [
                66.14579761460263, // 1:250 000
                26.458319045841044, // 1:100 0000
                15.874991427504629, // 1:60 0000
                10.583327618336419, // 1:40 00000
                5.2916638091682096 // 1:20 0000
                // 2.6458319045841048 // 1:10 0000
                // 1.3229159522920524, // 1:5000
                // 0.6614579761460262, // 1:2500
                // 0.2645831904584105, // 1:1000
                // 0.13229159522920521 // 1:500
            ],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: false,
            poi: true
        },
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
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
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: false,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
        },
        startUpModul: "",
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            visibleWFS: {
                minChars: 3
            },
            placeholder: "Suche nach Adresse, Stadtteil",
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Master",
            gfi: false
        },
        tools: {
            gfi: true,
            measure: false,
            print: false,
            coord: false,
            draw: false,
            active: "gfi"
        }
    };

    return config;
});
