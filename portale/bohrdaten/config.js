define(function () {

    var config = {
        allowParametricURL: false,
        view: {
            center: [565874, 5934140], // Rathausmarkt
            resolution: 66.14579761460263 // // 1:100.000
        },
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        scaleLine: true,
        startUpModul: "",
        print: {
            printID: "99999",
            title: "Trinkwasser",
            gfi: false
        },
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
