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
        * @type {Object}
        * @property {Object} tree - Das tree-Konfigurationsobject
        * @property {('light'|'custom'|'default')} tree.type - Art des trees. 'light' = einfache Auflistung, 'default' = FHH-Atlas, 'custom' = benutzerdefinierte Layerliste anhand json.
        * @property {Object[]} [tree.layer] - Bei type: light. Array, bestehend aus Layer-Konfigurationsobjekten.
        * @property {String} tree.layer.id - ID aus layerConf. Werden kommaseparierte ID übergeben, können WMS gemeinsam abgefragt werden.
        * @property {Boolean} tree.layer.visible - Initiale Sichtbarkeit des Layers.
        * @property {String} [tree.layer.style] - Nur bei WFS-Layern. Weist dem Layer den Style aus styleConf zu.
        * @property {String} [tree.layer.styles] - Nur bei WMS-Layern. Fragt dem WMS mit eingetragenem Styles-Eintrag ab.
        * @property {Number} [tree.layer.clusterDistance] - Nur bei WFS-Layern. Werte > 0 nutzen Clustering.
        * @property {String} [tree.layer.searchField] - Nur bei WFS-Layern. Wenn searchField auf Attributnamen gesetzt, werden die entsprecheden Values in der Searchbar gesucht.
        * @property {String} [tree.layer.styleField] - Nur bei WFS-Layern. Wenn styleField auf Attributname gesetzt, wird der jeweilge Wert für Style benutzt. styleConf muss angepasst werden.
        * @property {String} [tree.layer.styleLabelField] - Nur bei WFS-Layern. Wenn styleLabelField auf Attributname gesetzt, wird der jeweilge Wert für Label verwendet. Style muss entsprechend konfiguriert sein.
        * @property {String} [tree.layer.mouseHoverField] - Nur bei WFS-Layern. Wenn mouseHoverField auf Attributnamen gesetzt, stellt ein MouseHover-Event den Value als Popup dar.
        * @property {Object[]} [tree.layer.filterOptions] - Nur bei WFS-Layern. Array aus Filterdefinitionen. Jede Filterdefinition ist ein Objekt mit Angaben zum Filter.
        * @property {String} tree.layer.filterOptions.fieldName - Name des Attributes, auf das gefiltert werden soll.
        * @property {('combo')} tree.layer.filterOptions.filterType - Name des zulässigen Filtertyps. Derzeit nur combo.
        * @property {String} tree.layer.filterOptions.filterName - Name des Filters in der Oberfläche.
        * @property {Array} tree.layer.filterOptions.filterString - Array filterbarer Einträge.
        * @property {string} tree.layer.filterOptions.filterString.string - Eintrag, nach dem gefiltert werden kann.
        * @property {String|Object} [tree.layer.attribution] - Falls ein String gesetzt wird, wird dieser als Attribution gesetzt. Alternativ kann ein Konfigurationsobjekt einer Atribution übergeben werden.
        * @property {String} tree.layer.attribution.eventname - Name des Events, das abgefeuert wird.
        * @property {integer} tree.layer.attribution.timeout - Dauer in Millisekunden für setInterval.
        * @property {String} [tree.layer.opacity] - Wert für die voreingestellte Transparenz für den Layer.
        * @property {String} [tree.layer.minScale] - Mindestmaßstab zum Anzeigen dieses Layers.
        * @property {String} [tree.layer.maxScale] - Maximalmaßstab zum Anzeigen dieses Layers.
        * @property {Boolean} [tree.layer.routable] - Wert, ob dieser Layer beim GFI als Routing Destination ausgewählt werden darf. Setzt menu.routing == true vorraus.
        * @property {Array} [tree.layerIDsToMerge] - Bei type: custom|default. Arrays der Definitionen, die im Baum zusammengefasst werden.
        * @property {string[]} tree.layerIDsToMerge. - Array der LayerIDs.
        * @property {Object[]} [tree.layerIDsToStyle] - Bei type: custom|default. Array der Konfigurationsobjekte zur Styledefinition.
        * @property {string} tree.layerIDsToStyle.id - ID des Layers.
        * @property {string|string[]} tree.layerIDsToStyle.styles - Nur bei WMS-Layern. Fragt dem WMS mit eingetragenem Styles-Eintrag ab.
        * @property {string|string[]} tree.layerIDsToStyle.name - Bezeichnungen dieser Layer im Tree.
        * @property {string} [tree.customConfig] - Bei type: custom. URL der JSON mit der benutzerdefinierten Konfiguration.
        * @property {'opendata'|'inspire'} [tree.orderBy] - Bei type: default. Defaultkategorie der Layersortierung.
        * @property {string[]} [tree.layerIDsToIgnore] - Bei type: default. IDs der Layer, die im Tree ignoriert werden sollen.
        * @property {string[]} [tree.metaIDsToMerge] - Bei type: default. IDs der Metadaten, nach denen nicht zusammengefasst wird.
        * @property {string[]} [tree.metaIDsToIgnore] - Bei type: default. IDs der Metadaten, die nicht dargestellt werden sollen.
        * @desc Diese Konfiguration steuert die inhaltliche und graphische Ausgestaltung des Layertrees in der Menubar.
        */
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "1748", visible: false},
                {id: "1562", visible: false},
                {id: "1561", visible: false},
                {id: "2003", visible: false, style: "2003"},
                {id: "45", visible: false, style: "45", clusterDistance: 50, routable: true},
                {id:
                 [
                     {
                         id: "946",
                         attribution:
                         {
                             eventname: "aktualisiereverkehrsnetz",
                             timeout: (10 * 60000)
                         }
                     },
                     {
                         id: "947"
                     }
                 ],
                 name: "aktuelle Meldungen der TBZ", visible: false
                },
                {id: "1711", visible: false, style: "1711", clusterDistance: 0, searchField: "name", mouseHoverField: "name", attribution: "<strong><a href='http://www.hh.de/' target='_blank'>Attributierung für Fachlayer</a></strong>",
                 displayInTree: true,
                 maxScale: 60000,
                 minScale: 10000,
                 filterOptions: [
                     {
                         fieldName: "teilnahme_geburtsklinik",
                         filterType: "combo",
                         filterName: "Geburtsklinik",
                         filterString: ["*", "Ja", "Nein"]
                     },
                     {
                         fieldName: "teilnahme_notversorgung",
                         filterType: "combo",
                         filterName: "Not- und Unfallversorgung",
                         filterString: ["*", "Ja", "Eingeschränkt", "Nein"]
                     }
                 ],
                 routable: true
                },
                {id: "753", visibility: true, style: "753", clusterDistance: 0, searchField: "", mouseHoverField: "Name", filterOptions: [
                     {
                         fieldName: "Bezirk",
                         filterType: "combo",
                         filterName: "Bezirk",
                         filterString: ["*", "Altona"]
                     }
                 ], styleLabelField: "", styleField: "", routable: false}
            ]
        },
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
        * @desc Optionale Konfigurations-Einstellungen für die Map View
        * @property {Object} [view] - Das Konfigurationsobjekt zur View-Definition.
        * @property {Array} [view.center=[565874, 5934140]] - Die initiale Zentrumskoordinate.
        * @property {Number} [view.resolution=15.874991427504629] - Die initale Resolution der Karte.
        * @property {Array} [view.extent=[510000.0, 5850000.0, 625000.4, 6000000.0]] - Die Ausdehnung der Karte.
        * @property {Array} [view.resolutions=[66.14579761460263,26.458319045841044,15.874991427504629,10.583327618336419,5.2916638091682096,2.6458319045841048,1.3229159522920524,0.6614579761460262,0.2645831904584105,0.13229159522920521]] - Die Resolutions der Karte.
        * @property {Array} [view.epsg=EPSG:25832] - Der EPSG-Code.
        */
        view: {
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        /**
        * @memberof config
        * @type {Object}
        * @desc Konfiguration der Controls auf der Map
        * @property {Boolean}  [zoom=false] - Legt fest ob die Zoombuttons angezeigt werden sollen.
        * @property {Boolean}  [toggleMenu=false] - Legt fest ob die Menüleiste ein- und ausgeblendet werden kann.
        * @property {'none'|'allways'|'once'} [orientation=none] - Legt fest ob das Orientation-Modul geladen werden soll, oder nicht ('none'). Bei 'allways' wird zusätzlich zur Standpunktdarstellung auch auf die Position gezoomt. Bei 'once' wird nur einmalig gezoomt.
        * @property {Boolean}  [poi=false] - Legt fest ob die Points of Interest angezeigt werden sollen. Nur möglich, bei orientation: true.
        */
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: true
        },
        /**
        * @memberof config
        * @desc Lädt zusätzliche Module außerhalb der main.js
        * @type {Array}
        * @property {string[]} url - Relativer Pfad ab main.js.
        * @example customModules: ["../url", "../url"]
        * @default []
        */
        customModules: [],
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
                    "alias_mobil": "ttt"
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
        layerConf: "../components/lgv-config/services-fhhnet.json",
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
        menubar: true,
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
        * @type {Object}
        * @desc Hier lassen sich die einzelnen Menüeinträge/Funktionen für die Menüleiste konfigurieren.
        * @property {Object} menu - Das menu-Konfigurationsobject
        * @property {boolean} helpButton - auf false setzen
        * @property {Boolean} [menu.searchBar=false] - Legt fest, ob die Suchfunktion geladen werden soll.
        * @property {Boolean}  menu.layerTree - Legt fest, ob der Themenbaum geladen werden soll.
        * @property {Object}  menu.contactButton - Konfigurationsobjekt des Kontakt-Buttons.
        * @property {boolean} [menu.contactButton.on=false] Kontakt-Button anzeigen.
        * @property {string} menu.contactButton.email Emailadresse Empfänger.
        * @property {Boolean}  menu.tools - Legt fest, ob der Werkzeuge-Button angezeigt werden soll.
        * @property {Boolean}  menu.treeFilter - Legt fest, ob der Filter für die Straßenbäume angezeigt werden soll.
        * @property {Boolean}  menu.wfsFeatureFilter - Legt fest, ob der WFS-Filter geladen werden soll. Siehe {@link config.tree}.
        * @property {Boolean}  menu.legend - Legt fest, ob das Legendenmodul geladen werden soll.
        * @property {Boolean}  menu.routing - Legt fest, ob das RoutingModul geladen werden soll.
        * @property {Object[]}  [menu.formular] - Konfigurationsobjekt eines Formulars
        * @property {string}  menu.formular.title - Bezeichnung des Formulars
        * @property {string}  menu.formular.symbol - Symbolname
        * @property {string}  menu.formular.modelname - Modelname, wie in view definiert.
        * @property {integer}  menu.featureLister - Legt fest, dass das FeatureLister-Modul geladen werden soll, welches Vektorinformationen in einer Liste anzeigt. Wenn 0, dann ist es deaktiviert.
        * @example contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"}
        * @example formular: [{title: "Bestellung Grenznachweis", symbol: "glyphicon glyphicon-shopping-cart", modelname: "grenznachweis"}]
        * @todo helpButton
        */
        menu: {
            helpButton: false,
            searchBar: true,
            layerTree: true,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            featureLister: 20,
            treeFilter: false,
            wfsFeatureFilter: true,
            legend: true,
            routing: true,
            addWMS: true,
            formular: {}
        },
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
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
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
                suggestCount:10,
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=hh_hh_planung_festgestellt&propertyName=planrecht",
                        name: "bplan"
                    },
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=imverfahren&propertyName=plan",
                        name: "bplan"
                    }
                ]
            },
            visibleWFS: {
                minChars: 3
            },
            layer: {
                minChar: 3
            },
            placeholder: "Suche nach Adresse/Krankenhaus/B-Plan",
            geoLocateHit: true
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
        * @type {Object}
        * @desc Die Funktionen die unter dem Menüpunkt "Werkzeuge" gelistet werden können.
        * @property {Object} [tools] - Das Konfigurationsobjekt für die Tools/Werkzeuge.
        * @property {Object} [tools.parcelSearch] - Flurstückssuche.
        * @property {string} [tools.parcelSearch.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.parcelSearch.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.parcelSearch.isActive] - Tool initial aktiviert.
        * @property {Object} [tools.gfi] - GFI-Abfrage.
        * @property {string} [tools.gfi.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.gfi.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.gfi.isActive] - Tool initial aktiviert.
        * @property {Object} [tools.print] - Drucken.
        * @property {string} [tools.print.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.print.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.print.isActive] - Tool initial aktiviert.
        * @property {Object} [tools.coord] - Koordinateabfrage.
        * @property {string} [tools.coord.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.coord.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.coord.isActive] - Tool initial aktiviert.
        * @property {Object} [tools.measure] - Messen.
        * @property {string} [tools.measure.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.measure.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.measure.isActive] - Tool initial aktiviert.
        * @property {Object} [tools.draw] - Zeichnen.
        * @property {string} [tools.draw.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.draw.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.draw.isActive] - Tool initial aktiviert.
        * @property {Object} [tools.searchByCoord] - Koordinatensuche.
        * @property {string} [tools.searchByCoord.title] - Der Title in der Liste unter Werkzeuge.
        * @property {string} [tools.searchByCoord.glyphicon] - Das Glyphicon (Bootstrap Class).
        * @property {Boolean} [tools.searchByCoord.isActive] - Tool initial aktiviert.
        */
        tools: {
            parcelSearch: {
                title: "Flurstückssuche",
                glyphicon: "glyphicon-search"
            },
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            print: {
                title: "Karte drucken",
                glyphicon: "glyphicon-print"
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
            draw: {
                title: "Zeichnen / Schreiben",
                glyphicon: "glyphicon-pencil"
            },
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-search"
            }
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
