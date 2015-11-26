define(function () {
    /**
    * @namespace config
    * @desc Konfigurationsdatei für das LGV Master-Portal.
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
                {id: "1562", visible: true},
                {id: "1561", visible: true},
                {id: "2003", visible: true, style: "2003"},
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
                {id: "1711", visible: true, style: "1711", clusterDistance: 0, searchField: "name", mouseHoverField: "name", attribution: "<strong><a href='http://www.hh.de/' target='_blank'>Attributierung für Fachlayer</a></strong>",
                 displayInTree: true,
                 filterOptions: [
                     {
                         fieldName: "teilnahme_geburtsklinik",
                         filterType: "combo",
                         filterName: "Geburtsklinik",
                         filterString: ["*", "ja", "nein"]
                     },
                     {
                         fieldName: "teilnahme_notversorgung",
                         filterType: "combo",
                         filterName: "Not- und Unfallversorgung",
                         filterString: ["*", "ja", "eingeschränkt", "nein"]
                     }
                 ],
                 routable: true
                }
            ]
        },
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad Ordner mit IMGs, die für WFS-Stylesbenutzt werden.
        */
        wfsImgPath: "../components/lgv-config/img/",
        /**
        * @memberof config
        * @type {Boolean}
        * @property {string} [CENTER] - Zentrumskoordinate. Rechtswert, Hochwert. EPSG:25832.
        * @property {string} [LAYERIDS] - Kommagetrennte Aulistung der initial sichtbaren LayerIDs.
        * @property {Boolean} [ISMENUBARVISIBLE] - Legt fest, ob die Menüleiste initial aufgeklappt oder minimiert ist.
        * @property {'ROUTING'} [STARTUPMODUL] - Legt fest, welches Modul initial geladen werden soll. Derzeit nur für Routing verwendet.
        * @property {string} [QUERY] - Führt initial eine Suche nach diesem Suchstring aus.
        * @property {'DESKTOP'|'MOBILE'} [CLICKCOUNTER] - Legt fest, welcher, in der Config definierter, Klickzähler genutzt werden soll.
        * @desc Wenn TRUE, wird das Modul zur Auswertung parametrisierter Aufrufe geladen. Dieses Modul wertet folgende Parameter aus und übernimmt dessen spezielle Attribute eines parametrisierten Aufrufs und überschreibt damit Einstellungen der config.js.
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
            epsg: "EPSG:25832"*/
        },
        /**
        * @memberof config
        * @desc Konfiguration der Controls auf der Map
        * @property {Boolean}  zoom - Legt fest ob die Zoombuttons angezeigt werden sollen.
        * @property {Boolean}  toggleMenu - Legt fest ob die Menüleiste ein- und ausgeblendet werden kann.
        * @property {Boolean}  orientation - Legt fest ob der Knopf zur Standpunktpositionierung angezeigt werden soll.
        * @property {Boolean}  poi - Legt fest ob die Points of Interest angezeigt werden sollen.
        */
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
        footer: true,
        /**
        * @memberof config
        * @type {String}
        * @desc aktiviert das QuickHelp-Modul
        */
        quickHelp: true,

        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur services*.json mit den verfügbaren WMS-Layern bzw. WFS-FeatureTypes
        */
        layerConf: "../components/lgv-config/services-fhhnet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur json mit Druck- und WPS-Dienst
        */
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Style-Datei für die WFS-Dienste.
        */
        styleConf: "../components/lgv-config/style.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Konfig-Datei für den automatisiert generiereten Layerbaum
        */
        categoryConf: "../components/lgv-config/category.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Proxy-CGI
        */
        proxyURL: "/cgi-bin/proxy.cgi",
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/AttributionView.js geladen. Dieses Modul regelt die Darstellung der Layerattributierung aus layerConf oder layerIDs{attribution}.
        */
        attributions: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob das Portal eine Menüleiste(Navigationsleiste) haben soll oder nicht.
        */
        menubar: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/ScaleLineView.js geladen. Zeigt eine ScaleLine in der Map unten links an oder nicht. Benutze <div id="scaleLine" und <div id="scaleLineInner"></div>
        */
        scaleLine: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/MouseHoverPopupView.js geladen. Dieses Modul steuert die Darstellung des MouseHovers entsprechend layerIDs{mouseHoverField}
        */
        mouseHover: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob die Menubar initial ausgeklappt ist oder nicht.
        */
        isMenubarVisible: true,
        /**
        * @memberof config
        * @desc Hier lassen sich die einzelnen Menüeinträge/Funktionen für die Menüleiste aktivieren/deaktivieren.
        * @property {Boolean}  searchBar - Die Suchfunktion.
        * @property {Boolean}  layerTree - Der Themenbaum
        * @property {Boolean}  helpButton - Der Hilfe-Button.
        * @property {Object}  contactButton - Der Kontakt-Button. {on: true|false, email: string}. Default für email ist LGVGeoPortal-Hilfe@gv.hamburg.de
        * @property {Boolean}  tools - Die Werkzeuge
        * @property {Boolean}  treeFilter - Der Filter für die Straßenbäume.
        * @property {Boolean}  wfsFeatureFilter - Der WFS-Filter. Filterung entsprechend Eintrag in layerIDs{filterOptions}.
        * @property {Boolean}  legend - Die Legende
        * @property {Boolean}  routing - Wenn TRUE, wird in main.js views/RoutingView.js geladen. Möglichkeit der Routenberechnung.
        */
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: true,
            legend: true,
            routing: true,
            addWMS: true
        },
        /**
        * @memberof config
        * @desc Konfiguration des beim Starten zu ladenden Moduls. Funktioniert derzeit mit wfsFeatureFilter und Routing. Wird auch im parametrisierten Aufruf erkannt.
        * @property {String}  Name des Moduls.
        */
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
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
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
            placeholder: "Suche nach Adresse/Krankenhaus/B-Plan",
            geoLocateHit: true
        },

        bPlan: {
            url: function () {
                return "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene";
            }
        },
                 /**
        * @memberof config
        * @desc Konfiguration für den Druckdienst.
        * @property {String}  url - Die Druckdienst-URL
        * @property {String}  title - Der Titel erscheint auf dem Ausdruck der Karte.
        * @property {Boolean}  gfi - Bisher nur teilweise umgesetzt. Nur möglich wenn die Anzahl der GFI-Attribute genau sechs ist(Straßenbaumkataster).
        */
        print: {
            printID: "99999",
            title: "Master",
            gfi: false
        },
        /**
        * @memberof config
        * @desc Die Funktionen die unter dem Menüpunkt "Werkzeuge" aktiviert/deaktiviert werden können.
        * @property {Boolean}  gfi - GetFeatureInfo-Abfrage.
        * @property {Boolean}  measure - Messen.
        * @property {Boolean}  draw - Zeichnen.
        * @property {Boolean}  print - Drucken.
        * @property {Boolean}  coord - Koordinaten-Abfrage.
        * @property {String}  active - Die Funktion die initial auf der Karte registriert ist. Mögliche Werte: "gfi", "coord" oder "measure".
        */
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: true,
            active: "gfi"
        }
    };

    return config;
});
