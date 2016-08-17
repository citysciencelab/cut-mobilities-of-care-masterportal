define(function () {
    /**
    * @namespace config
    * @type {Object}
    * @desc Konfigurationsdatei für das LGV Master-Portal. Liegt neben index.html im gleichen Verzeichnis.
    * @example JS-Aufbau:
    define(function () {
        return config = {
        }
    });
    */
    var config = {
        /**
        * @memberof config
        * @type {String}
        * @desc Titel des Portals
        * @example title: "FHH - Atlas"
        */
        title: "Master",
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Erstellt einen SimpleMap-Link (Nur die Karte mit Layern ohne Menü).
        * @example simpleMap: true
        */
        simpleMap: false,
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zum Ordner mit IMGs, die für WFS-Styles benutzt werden ausgehend von main.js.
        * @example wfsImgPath: "../components/lgv-config/img/"
        */
        wfsImgPath: "../components/lgv-config/img/",
        /**
        * @memberof config
        * @type {Boolean}
        * @property {string} [FEATUREID] - id (oder ids, komma-separiert) der WFS-Features auf dessen/deren BBoxes der initiale Kartenextent gestellt wird..
        * @property {string} [CENTER] - Zentrumskoordinate. Rechtswert, Hochwert. EPSG:25832. Siehe {@link config.view}.
        * @property {string} [LAYERIDS] - Kommagetrennte Aulistung der initial sichtbaren LayerIDs. Siehe {@link config.tree}.
        * @property {string} [VISIBILITY] - Kommagetrennte Aulistung der Sichtbarkeit, der unter LAYERIDS genannten Layer. Nur bei tree.type: custom interessant.
        * @property {Boolean} [ISMENUBARVISIBLE] - Legt fest, ob die Menüleiste initial aufgeklappt oder minimiert ist. Siehe {@link config.isMenubarVisible}.
        * @property {'ROUTING'} [STARTUPMODUL] - Legt fest, welches Modul initial geladen werden soll. Derzeit nur für Routing verwendet. Siehe {@link config.menu}.
        * @property {string} [QUERY] - Führt initial eine Suche nach diesem Suchstring aus. Siehe {@link config.searchBar}.
        * @property {'DESKTOP'|'MOBILE'} [CLICKCOUNTER] - Legt fest, welcher, in der Config definierter, Klickzähler genutzt werden soll. Siehe {@link config.clickCounter}.
        * @desc Wenn TRUE, wird das Modul zur Auswertung parametrisierter Aufrufe geladen. Dieses Modul wertet folgende Parameter aus und übernimmt dessen spezielle Attribute eines parametrisierten Aufrufs und überschreibt damit Einstellungen der config.js.
        * @example http://geoportal-hamburg.de/verkehrsportal/?layerids=453,1935&center=560759,5932000&zoomlevel=5&clickcounter=desktop&ismenubarvisible=false
        * @default [false]
        */
        allowParametricURL: true,

        /**
        * @memberof config
        * @type {Object}
        * @desc Optionale Konfigurations-Einstellungen für den URL parameter "featureid"
        * @property {string} [url] - URL zum WFS.
        * @property {string} [version] - Die Version des WFS.
        * @property {string} [typename] - typename des WFS. Entspricht Tabelle. Kommt beim request in den Filter.
        * @property {string} [valuereference] - valuereference. Entspricht Spalte. Kommt beim request in den Filter.
        * @property {string} [imglink] - Link für den Marker.
        * @property {string} [layerid] - ID des layers an den die Marker gekoppelt werden.
        */
        zoomtofeature: {
            url: "http://geodienste.hamburg.de/Test_HH_WFST_Eventlotse",
            version: "2.0.0",
            typename: "app:hamburgconvention",
            valuereference: "app:flaechenid",
            imglink: "../img/location_eventlotse.svg",
            layerid: "4426"
        },
        /**
        * @memberof config
        * @type {Object}
        * @desc Optionale Konfigurations-Einstellungen für die Map View
        * @property {Object} [view] - Das Konfigurationsobjekt zur View-Definition.
        * @property {String} [view.background] - Kartenhintergrund, mögliche Werte "white" oder "default".
        * @property {Array} [view.center=[565874, 5934140]] - Die initiale Zentrumskoordinate.
        * @property {Number} [view.resolution=15.874991427504629] - Die initale Resolution der Karte.
        * @property {Array} [view.extent=[510000.0, 5850000.0, 625000.4, 6000000.0]] - Die Ausdehnung der Karte.
        * @property {Array} [view.resolutions=[66.14579761460263,26.458319045841044,15.874991427504629,10.583327618336419,5.2916638091682096,2.6458319045841048,1.3229159522920524,0.6614579761460262,0.2645831904584105,0.13229159522920521]] - Die Resolutions der Karte.
        * @property {Array} [view.epsg=EPSG:25832] - Der EPSG-Code.
        */
        view: {
            background: "white"
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        /**
        * @memberof config
        * @desc Lädt zusätzliche Module außerhalb der main.js
        * @type {Array}
        * @property {string[]} url - Relativer Pfad ab main.js.
        * @example customModules: ["../url", "../url"]
        * @default []
        */
        customModules: ["../portale/master/verkehrsfunctions"],
        /**
        * @memberof config
        * @type {Object}
        * @desc Zeigt einen Footer-Bereich an.
        * @property {Object} [footer] - Konfigurationsobjekt für den Footer.
        * @property {Boolean} footer.visibility - Schaltet den Footer sichtbar.
        * @property {Object[]} [footer.urls] - Das Array besteht aus Objekten mit den Attributen bezeichnung, url, alias und alias_mobil. Wenn nicht gesetzt, kommen default-werte.
        * @property {string} footer.urls.bezeichnung - Bezeichnung vor dem Link.
        * @property {string} footer.urls.url - Aufzurufende URL.
        * @property {string} footer.urls.alias - Bezeichnung bei Desktop-Ausspielung des Links.
        * @property {string} [footer.urls.alias_mobil] - Bezeichnung bei mobiler Ausspielung. Wird ignoriert, wenn nicht gesetzt.
        */
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
        /**
        * @memberof config
        * @default [false]
        * @type {Boolean}
        * @desc Aktiviert das QuickHelp-Modul.
        */
        quickHelp: true,
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur services*.json mit den verfügbaren WMS-Layern bzw. WFS-FeatureTypes.
        * @example layerConf: "../components/lgv-config/services-fhhnet.json"
        */
        layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur json mit Druck- und WPS-Dienst.
        * @example restConf: "../components/lgv-config/rest-services-fhhnet.json"
        */
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Style-Datei für die WFS-Dienste.
        * @example styleConf: "../components/lgv-config/style.json"
        */
        styleConf: "../components/lgv-config/style.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Proxy-CGI.
        * @example proxyURL: "/cgi-bin/proxy.cgi"
        */
        proxyURL: "/cgi-bin/proxy.cgi",
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Regelt die Darstellung der Layerattributierung aus layerConf oder {@link config.tree}.
        * @default [false]
        */
        attributions: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob das Portal eine Menüleiste(Navigationsleiste) haben soll oder nicht.
        * @default [false]
        */
        // menubar: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Zeigt eine ScaleLine in der Map unten links an oder nicht.
        * @default [false]
        */
        scaleLine: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert die Darstellung des MouseHovers. Siehe {@link config.tree}
        * @default [false]
        */
        mouseHover: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob die Menubar initial ausgeklappt ist oder nicht.
        * @default [true]
        */
        isMenubarVisible: true,
        /**
        * @memberof config
        * @type {String}
        * @desc Legt das Modul fest, das beim Starten geööfnet wird. Funktioniert derzeit nur mit Routing. Wird auch im parametrisierten Aufruf {@link config.allowParametricURL}erkannt.
        * @default ""
        */
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
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                suggestCount: 10,
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                        data: "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_festgestellt&propertyName=planrecht",
                        name: "bplan"
                    },
                    {
                        url: "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                        data: "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_imverfahren&propertyName=plan",
                        name: "bplan"
                    }
                ]
            },
            visibleWFS: {
                minChars: 3
            },
            // layer: {
            //     minChar: 3
            // },
            placeholder: "Suche nach Adresse/Krankenhaus/B-Plan"
        },
        /**
        * @memberof config
        * @type {Object}
        * @desc Konfiguration für den Druckdienst.
        * @property {String}  printID - ID des Druckdienstes in der restServices.json. Siehe {@link config.restConf}.
        * @property {String}  title - Der Titel erscheint auf dem Ausdruck der Karte.
        * @property {Boolean}  gfi - Gibt an, ob nur die Karte oder auch geöffnete GFI-Informationen ausgedruckt werden sollen.
        */
        print: {
            printID: "99999",
            title: "Master",
            gfi: false
        },
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Legt fest, ob die geoAPI Schnittstelle geladen werden soll.
        * @default [false]
        */
        geoAPI: false,
        /**
        * @memberof config
        * @type {Object}
        * @desc Konfigurationsobjekt des ClickCounterModuls. Dieses lädt für jeden registrierten Klick ein iFrame.
        * @property {Object} [clickCounter] - Konfigurationsobjekt
        * @property {'desktop'|'mobil'} [clickCounter.version] - Legt fest, an welche URL gemeldet werden soll. Siehe auch {@link config.allowParametricURL}
        * @property {string} clickCounter.desktop - URL des iFrame bei Desktopausspielung.
        * @property {string} clickCounter.mobil - URL des iFrame bei mobiler Ausspielung.
        * @example clickCounter: {version: "", desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html", mobil: "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"}
        */
        clickCounter: {},
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur gemarkung.json für die Flurstückssuche.
        */
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
