define(function () {
    /**
    * @namespace config
    * @desc Beschreibung
    */
    var config = {
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js models/ParametricURL.js geladen. Dieses Modul übernimmt spezielle Attribute eines parametrisierten Aufrufs und überschreibt damit Einstellungen der config.js
        */
        allowParametricURL: false,
        /**
        * @memberof config
        * @desc Optionale Konfigurations-Einstellungen für die Map View
        * @property {Array}  center - Die initiale Zentrumskoordinate. Default ist [565874, 5934140]
        * @property {Number}  resolution - Die initale Resolution der Karte. Default ist 15.874991427504629, das entsprich einen Maßstab von 1:60000.
        * @property {Number}  scale - Der initiale Maßstab.
        * @property {Array}  extent - Der ol.view.extent der Karte. Default ist [510000.0, 5850000.0, 625000.4, 6000000.0]
        * @property {Array}  resolutions - Die Resolutions der Karte. Default 1:250000 - 1:1000
        * @property {Array}  epsg - Der EPSG-Code. Default ist EPSG:25832
        */
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
        },
        /**
        * @memberof config
        * @type {String}
        * @desc zeigt einen Footer-Bereich an
        */
        footer: false,
        /**
        * @memberof config
        * @type {String}
        * @desc aktiviert das QuickHelp-Modul
        */
        quickHelp: false,

        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur DienstAPI.
        */
        layerConf: "../components/lgv-config/services-fhhnet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur JSON für sonstige Dienste mit REST-Schnittstelle.
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
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396", visible: true, name: "Alkis Liegenschaftskarte"},
                {id: "2295,2296", visible: true, name: "Alkis Grenznachweis"}
                ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: false,
            poi: false
        },
        /**
        * @memberof config
        * @type {String}
        * @desc ID der WPS-Definition in restConf
        */
        wpsID: "99998",
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/AttributionView.js geladen. Dieses Modul regelt die Darstellung der Layerattributierung aus layerConf oder layerIDs{attribution}.
        */
        attributions: false,
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
        mouseHover: false,
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
        * @property {Boolean}  wfsFeatureFilter - Der WFS-Filter. Filterung entsprechend Eintrag in layerIDs{filterOptions}.
        * @property {Boolean}  legend - Die Legende
        * @property {Boolean}  routing - Wenn TRUE, wird in main.js views/RoutingView.js geladen. Möglichkeit der Routenberechnung.
        * @property {String}  formular - Wenn TRUE, wird ein Knopf eingebunden, der den String enthält
        */
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: false,
            formular: [{
                title: "Bestellung Grenznachweis",
                symbol: "glyphicon glyphicon-shopping-cart",
                modelname: "grenznachweis"
            }]
        },
        /**
        * @memberof config
        * @desc Konfiguration des beim Starten zu ladenden Moduls. Funktioniert derzeit mit Routing. Wird auch im parametrisierten Aufruf erkannt.
        * @property {String}  Name des Moduls.
        */
        startUpModul: "",
        /**
        * @memberof config
        * @desc Konfiguration für die Suchfunktion. Workaround für IE9 implementiert.
        * @property {String}  placeholder - Der Text der initial in der Suchmaske steht.
        * @property {Function}  gazetteerURL - Die Gazetteer-URL.
        */
        searchBar: {
            placeholder: "Suche nach Adresse",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: false,
                searchParcels: true
            },
            geoLocateHit: true
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
            title: "Grenznchweis",
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
            coord: false,
            draw: false,
            record: false,
            active: ""
        }
    };

    return config;
});
