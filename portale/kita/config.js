define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
               // {id: "682", visible: true},
               // {id: "683", visible: false}
                {id: "753", visibility: true, style: "753", clusterDistance: 0, searchField: "", mouseHoverField: "Name", filterOptions: [], styleLabelField: "", styleField: "", routable: false}
            ]
        },
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],// Rathausmarkt
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: true
        },
        /**
        * customModules
        * @memberof config
        * @type {Array}
        * @desc lädt die Module
        */
        // customModules: ["customModule1", "customModule2"]
        /**
        * @memberof config
        * @type {String}
        * @desc zeigt einen Footer-Bereich an
        */
        footer: false,
        quickHelp: true,

        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
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
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: true,
            addWMS: false
        },
        startUpModul: "",
        /**
        * @memberof config
        * @desc Konfiguration für die Suchfunktion. Workaround für IE9 implementiert.
        * @property {Object} gazetteer Konfigurationsobjekt für die Gazeteer-Suche
        * @property {string} gazetteer.url - Die URL.
        * @property {boolean} gazetteer.searchStreets - Soll nach Straßennamen gesucht werden? Vorraussetzung für searchHouseNumbers. Default: false.
        * @property {boolean} gazetteer.searchHouseNumbers - Sollen auch Hausnummern gesucht werden oder nur Straßen? Default: false.
        * @property {boolean} gazetteer.searchDistricts - Soll nach Stadtteilen gesucht werden? Default: false.
        * @property {boolean} gazetteer.searchParcels - Soll nach Flurstücken gesucht werden? Default: false.
        * @property {integer} gazetteer.minChars - Mindestanzahl an Characters im Suchstring, bevor Suche initieert wird. Default: 3.
        * @property {Object} bkg Konfigurationsobjekt für die Suche auf dem BKG Geokodierungsdienst
        * @property {integer} bkg.minChars - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {string} bkg.bkgSuggestURL - URL für schnelles Suggest.
        * @property {string} bkg.bkgSearchURL - URL für ausführliche Search.
        * @property {float} bkg.extent - Koordinatenbasierte Ausdehnung in der gesucht wird.
        * @property {string} bkg.epsg - EPSG-Code des verwendeten Koordinatensystems.
        * @property {string} bkg.filter - Filterstring
        * @property {float} bkg.score - Score-Wert, der die Qualität der Ergebnisse auswertet.
        * @property {Object} specialWFS Konfigurationsobjekt für die server-seitige Suche auf WFS.
        * @property {integer} specialWFS.minChars - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {string} specialWFS.url - Die URL des WFS
        * @property {string} specialWFS.data - Query string des WFS-Request
        * @property {string} specialWFS.name - Name der speziellen Filterfunktion (bplan|olympia|paralympia)
        * @property {Object} visibleWFS Konfigurationsobjekt für die client-seitige Suche auf bereits geladenen WFS-Layern. Weitere Konfiguration am Layer, s. searchField in {@link config#layerIDs}.
        * @property {integer} visibleWFS.minChars - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        */
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_kitaeinrichtung?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeName=app:KitaEinrichtungen",
                        name: "kita"
                    }
                ]
            },
            visibleWFS: {
                minChars: 3
            },
            placeholder: "Suche nach Adresse oder Kita-Namen",
            geoLocateHit: true
        },      
        print: {
            printID: "99999",
            title: "Kita-Stadtplan",
            gfi: false
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
            }
        }
    };

    return config;
});
