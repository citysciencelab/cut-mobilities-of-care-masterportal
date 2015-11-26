define(function() {

    var config = {
        baseLayer: [
            {
                id: "39",
                visibility: true
            },
            {
                id: "487",
                visibility: false
            },
            {
                id: "2625",
                visibility: false
            }
        ],
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        isMenubarVisible: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        menu: {
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
        menubar: true,
        print: {
            printID: "99999",
            title: "Master-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        scaleLine: true,
        searchBar: {
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            tree: {
                minChars: 3
            },
            placeholder: "Suche nach Ort/Thema",
            geoLocateHit: true
        },
        styleConf: "../components/lgv-config/style.json",
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: false,
            active: "gfi",
            record: false
        },
        tree: {
            custom: true,
            filter: false,
            customConfig: "../components/lgv-config/tree-config/simpleTree.json"
        },
        view: {
            center: [565874, 5934140],
            epsg: "EPSG:25832",
            // extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
            resolution: 76.43718115953851,
            options: [
                {
                    resolution: 152.87436231907702,
                    scale: "250000",
                    zoomLevel: 1
                },
                {
                    resolution: 76.43718115953851,
                    scale: "100000",
                    zoomLevel: 2
                },
                {
                    resolution: 38.21859057976939,
                    scale: "60000",
                    zoomLevel: 3
                },
                {
                    resolution: 19.109295289884642,
                    scale: "40000",
                    zoomLevel: 4
                },
                {
                    resolution: 9.554647644942321,
                    scale: "20000",
                    zoomLevel: 5
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "10000",
                    zoomLevel: 6
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "5000",
                    zoomLevel: 7
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "2500",
                    zoomLevel: 8
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "1000",
                    zoomLevel: 9
                }
            ]
        },
        wfsImgPath: "../components/lgv-config/img/"
    };

    return config;
});
