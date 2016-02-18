define(function () {
    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140]
        },
        customModules: ["../portale/mietenspiegel-formular/mietenspiegelform"],
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        tree: {
            type: "light",
            layer: [
                {id: "2834", visible: true, gfiTheme: "mietenspiegel"},
                {id: "2730", visible: false, displayInTree: false},
                {id: "2731", visible: false, displayInTree: false}
            ]
        },
        controls: {
            zoom: false,
            toggleMenu: false,
            orientation: false,
            poi: false
        },
        menubar: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "Mietenspiegel HH",
            searchBar: true,
            layerTree: false,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: false,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: false
        },
        searchBar: {
            placeholder: "Adresse eingeben",
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: false,
                searchParcels: false
            },
            geoLocateHit: true
        },
        print: {
            printID: "99997",
            title: "Freie und Hansestadt Hamburg - Mietenspiegel",
            outputFilename: "Ausdruck Hamburger Mietenspiegel",
            gfi: true
        },
        tools: {
            gfi: false,
            measure: false,
            print: false,
            coord: false,
            draw: false,
            record: false,
            active: "gfi"
        }
    };

    return config;
});
