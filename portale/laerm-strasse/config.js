define(function () {
    var config = {
        //title: "Lärmkarte-Straßenverkehr",
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,

        view: {
            background: "white"
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
       // customModules: ["../portale/master/verkehrsfunctions"],
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
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob das Portal eine Menüleiste(Navigationsleiste) haben soll oder nicht.
        * @default [false]
        */
        // menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",

        searchBar: {
            minChars: 3,
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },

            visibleWFS: {
                minChars: 3
            },
            // layer: {
            //     minChar: 3
            // },
            placeholder: "Suche nach Adresse/Stadtteil"
        },
        print: {
            printID: "99999",
            title: "Lärmkarte-Straßenverkehr",
            gfi: false,
            configYAML: "laerm_strasse"
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
