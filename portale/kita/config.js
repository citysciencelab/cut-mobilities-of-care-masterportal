define(function () {
    var config = {
        title: "Kita-Stadtplan",
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
            resolution: 66.14579761460263
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        //customModules: ["../portale/master/verkehrsfunctions"],
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
        layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
       
        attributions: true,
        // menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",
        /**
        * @memberof config
        * @type {Object}
        * @desc Konfiguration für die Suchfunktion. Workaround für IE9 implementiert.
        * @property {Object} [visibleWFS] Konfigurationsobjekt für die client-seitige Suche auf bereits geladenen WFS-Layern. Weitere Konfiguration am Layer, s. searchField in {@link config#layerIDs}.
        * @property {integer} [visibleWFS.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {Object} [tree] - Das Konfigurationsobjekt der Tree-Suche, wenn Treesuche gewünscht.
        * @property {integer} [tree.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {Objekt} [specialWFS] - Das Konfigurationsarray für die specialWFS-Suche
        * @property {integer} [specialWFS.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {Object[]} specialWFS.definitions - Definitionen der SpecialWFS.
        * @property {Object} specialWFS.definitions[].definition - Definition eines SpecialWFS.
        * @property {string} specialWFS.definitions[].definition.url - Die URL, des WFS
        * @property {string} specialWFS.definitions[].definition.data - Query string des WFS-Request
        * @property {string} specialWFS.definitions[].definition.name - Name der speziellen Filterfunktion (bplan|olympia|paralympia)
        * @property {Object} bkg - Das Konfigurationsobjet der BKG Suche.
        * @property {integer} [bkg.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {string} bkg.bkgSuggestURL - URL für schnelles Suggest.
        * @property {string} [bkg.bkgSearchURL] - URL für ausführliche Search.
        * @property {float} [bkg.extent=454591, 5809000, 700000, 6075769] - Koordinatenbasierte Ausdehnung in der gesucht wird.
        * @property {integer} [bkg.suggestCount=20] - Anzahl der über suggest angefragten Vorschläge.
        * @property {string} [bkg.epsg=EPSG:25832] - EPSG-Code des verwendeten Koordinatensystems.
        * @property {string} [bkg.filter=filter=(typ:*)] - Filterstring
        * @property {float} [bkg.score=0.6] - Score-Wert, der die Qualität der Ergebnisse auswertet.
        * @property {Object} [gazetteer] - Das Konfigurationsobjekt für die Gazetteer-Suche.
        * @property {string} gazetteer.url - Die URL.
        * @property {boolean} [gazetteer.searchStreets=false] - Soll nach Straßennamen gesucht werden? Vorraussetzung für searchHouseNumbers. Default: false.
        * @property {boolean} [gazetteer.searchHouseNumbers=false] - Sollen auch Hausnummern gesucht werden oder nur Straßen? Default: false.
        * @property {boolean} [gazetteer.searchDistricts=false] - Soll nach Stadtteilen gesucht werden? Default: false.
        * @property {boolean} [gazetteer.searchParcels=false] - Soll nach Flurstücken gesucht werden? Default: false.
        * @property {integer} [gazetteer.minCharacters=3] - Mindestanzahl an Characters im Suchstring, bevor Suche initieert wird. Default: 3.
        * @property {string} [initialQuery] - Initialer Suchstring.
        */
<<<<<<< HEAD
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
            specialWFS: {
                minChar: 2,
                definitions: [
                    {
                        url: "/geodienste_hamburg_de/HH_WFS_KitaEinrichtung",
                        data: "service=WFS&request=GetFeature&version=2.0.0&typeNames=app:KitaEinrichtungen&propertyName=app:Name,app:geom",
                        name: "kita"
                    }
                ]
            },
            visibleWFS: {
                minChars: 3
            },
            // layer: {
            //     minChar: 3
            // },
            placeholder: "Suche nach Adresse/ Stadtteil/ Kita-Namen"
        },
=======
>>>>>>> 6a7e48d97d85e6ddabbe38e62a3565c9642909ba
        print: {
            printID: "99999",
            title: "Kita-Stadtplan",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
