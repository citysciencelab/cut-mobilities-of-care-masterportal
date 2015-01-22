define(function () {
    /**
    * @namespace config
    * @desc Beschreibung
    */
    var config = {
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
        */
        allowParametricURL: true,
        /**
        * @memberof config
        * @desc Die initiale Zentrums-Koordinate und die Resolution
        * @property {Array}  center - Die initiale Zentrumskoordinate.
        * @property {Number}  resolution - Die initale Resolution der Karte. Default ist 15.874991427504629, das entsprich einen Maßstab von 1:60000.
        * @property {Number}  scale - Der initiale Maßstab.
        */
        view: {
            center: [565874, 5934140],
            resolution: 15.874991427504629,
            scale: 60000 // für print.js benötigt
        },
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur DienstAPI.
        */
        layerConf: locations.master + '/diensteapiFHHNET.json',
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Style-Datei für die WFS-Dienste.
        */
        styleConf: locations.master + '/style.json',
        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        proxyURL: '/cgi-bin/proxy.cgi',
        /**
        * @memberof config
        * @type {Object[]}
        * @property {String|Array}  id - Beschreibung.
        * @property {Boolean}  visible - Beschreibung.
        * @property {String|Array}  style - Beschreibung.
        * @property {Number}  clusterDistance - Beschreibung.
        * @property {String}  searchField - Beschreibung.
        * @property {String}  mouseHoverField - Beschreibung.
        * @property {Object[]}  filterOptions - Beschreibung.
        * @property {String}  filterOptions.fieldName - Beschreibung.
        * @property {String}  styleLabelField - Beschreibung.
        * @desc Beschreibung.
        */
        layerIDs: [
            {id: '453', visible: true},
            {id: '8', visible: false},
            {id: '1346', visible: true},
            {id: '358', visible: false, style: '358', clusterDistance: 30, searchField: '', styleField :'Kategorie'},
            {id: '45', visible: false, style: '45', clusterDistance: 40, searchField: '', mouseHoverField: '', filterOptions: [], styleLabelField: ''},
            {id: '359', visible: false, style: '359', clusterDistance: 30, searchField: '', styleField :'Kategorie'},
            {id:
             [
                 {
                     id: '1364',
                     attribution:
                     {
                         eventname: 'aktualisiereverkehrsnetz',
                         timeout: (10 * 60000)
                     }
                 },
                 {
                     id: '1365'
                 }
             ],
             name: 'Verkehrsbelastung auf Autobahnen', visible: true
            },
            {
                id: '1711',
                visible: false,
                attribution: 'Krankenhausattributierung in config',
                style: '1711',
                clusterDistance: 0,
                searchField: 'name',
                mouseHoverField: 'name',
                filterOptions: [
                    {
                        'fieldName': 'teilnahme_geburtsklinik',
                        'filterType': 'combo',
                        'filterName': 'Geburtsklinik',
                        'filterString': ['*','ja','nein']
                     },
                     {
                         'fieldName': 'teilnahme_notversorgung',
                         'filterType': 'combo',
                         'filterName': 'Not- und Unfallversorgung',
                         'filterString': ['*','ja','eingeschränkt','nein']
                     }
                ]
            }
        ],
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
        */
        attributions: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob das Porta eine Menüleiste(Navigationsleiste) haben soll oder nicht.
        */
        menubar: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Zeigt eine ScaleLine in der Map unten links an oder nicht. Benutze <div id="scaleLine" und <div id="scaleLineInner"></div>
        */
        scaleLine: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
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
        * @property {Boolean}  contactButton - Der Kontakt-Button.
        * @property {Boolean}  tools - Die Werkzeuge
        * @property {Boolean}  treeFilter - Der Filter für die Straßenbäume.
        * @property {Boolean}  wfsFeatureFilter -
        * @property {Boolean}  legend - Die Legende
        * @property {Boolean}  routing - Die Routingfunktion
        */
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: true,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: true,
            legend: true,
            routing: true
        },
        /**
        * @memberof config
        * @desc Konfiguration für die Suchfunktion.
        * @property {String}  placeholder - Der Text der initial in der Suchmaske steht.
        * @property {Function}  gazetteerURL - Die Gazetteer-URL.
        */
        searchBar: {
            placeholder: "Suche Adresse, B-Plan",
            gazetteerURL: function () {
                if (window.location.host === "wscd0096" || window.location.host === "wscd0095") {
                    return locations.host + "/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return "http://geodienste-hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
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
            url: function () {
                if (window.location.host === "wscd0096" || window.location.host === "wscd0095") {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return locations.host + "/mapfish_print_2.0/";
                }
            },
            title: 'Master',
            gfi: false
        },
        /**
        * @memberof config
        * @desc Die Funktionen die unter dem Menüpunkt "Werkzeuge" aktiviert/deaktiviert werden können.
        * @property {Boolean}  gfi - GetFeatureInfo-Abfrage.
        * @property {Boolean}  measure - Messen.
        * @property {Boolean}  print - Drucken.
        * @property {Boolean}  coord - Koordinaten-Abfrage.
        * @property {String}  active - Die Funktion die initial auf der Karte registriert ist. Mögliche Werte: "gfi", "coord" oder "measure".
        */
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            active: 'gfi'
        },
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
        */
        orientation: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
        */
        poi: true
    }

    return config;
});
