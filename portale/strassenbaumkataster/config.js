define(function () {
    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140],
            resolution: 5.2916638091682096
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        treeConf: "../components/lgv-config/tree.json",
        scaleLine: true,
        startUpModul: "",
        searchBar: {
            minChars: 3,
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true
            }
        },
        print: {
            printID: "99999",
            title: "Straßenbäume online",
            gfi: true
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
