define(function () {
    var config = {
        allowParametricURL: false,
        view: {},
        customModules: ["../portale/mietenspiegel-formular/mietenspiegelform"],
        layerConf: "/lgv-config/services-fhhnet.json",
        restConf: "/lgv-config/rest-services-fhhnet.json",
        styleConf: "/lgv-config/style.json",
        tree: {
            type: "light",
            layer: [
                {id: "2834", visible: true, gfiTheme: "mietenspiegel", displayInTree: false},
                {id: "2730", visible: false, displayInTree: false},
                {id: "2731", visible: false, displayInTree: false}
            ]
        },
        controls: {},
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
        }
    };

    return config;
});
