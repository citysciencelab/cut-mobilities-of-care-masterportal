define(function () {
    var config = {
        title: "Solaratlas",
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
         zoomtofeature: {
            url: "http://geodienste.hamburg.de/Test_HH_WFST_Eventlotse",
            version: "2.0.0",
            typename: "app:hamburgconvention",
            valuereference: "app:flaechenid",
            imglink: "../img/location_eventlotse.svg",
            layerid: "4426"
        },
        view: {
            background: "white",
            resolution: 26.458319045841044
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        customModules: [],

        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
                    "alias_mobil": "LGV"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                    "alias": "SDP Download",
                    "alias_mobil": "SDP"
                },
                {
                    "bezeichnung": "",
                    "url": "http://www.hamburg.de/bsu/timonline",
                    "alias": "Kartenunstimmigkeit"
                }
            ]
        },
        quickHelp: true,
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",

        attributions: true,
        // menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,

        menu: {

            formular: {}
        },
        startUpModul: "",
        searchBar: {
            minChars: 3,
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: false,
                searchParcels: false
            },
            placeholder: "Suche nach Adresse"
        },
        print: {
            printID: "99999",
            title: "Solaratlas",
            gfi: true,
            configYAML: "solar_atlas"
        },

        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
