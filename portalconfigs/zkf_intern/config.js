define(function () {
    /**
    * @namespace config
    * @desc Beschreibung
    */
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zum img-Ordner für WFS-Styles
        */
        wfsImgPath: "../node_modules/lgv-config/img/",
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js models/ParametricURL.js geladen. Dieses Modul übernimmt spezielle Attribute eines parametrisierten Aufrufs und überschreibt damit Einstellungen der config.js
        */
        allowParametricURL: false,
        tree: {
            type: "custom",
            baseLayer: [
                {id: "8", visibility: false},
                {id: "453", visibility: true}
            ],
            customConfig: "../node_modules/lgv-config/tree-config/zkf.json"
        },
        controls: {
            zoom: true,
            toggleMenu: true
        },
        /**
        * @desc Erlaubt für einzelne Layer mehr Objekte pro GFI-request zuzulassen.
        * @memberof config
        * @property {number} id - Die Id der Layer
        * @property {number} count -Anzahl der Objekte pro GFI
        */
        feature_count: [
            {
                id: 4,
                count: 5
            }
        ],
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
            resolution: 15.874991427504629
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
        layerConf: "/zkf_intern/zkf.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur json mit Druck- und WPS-Dienst
        */
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Style-Datei für die WFS-Dienste.
        */
        styleConf: "../node_modules/lgv-config/style.json",
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
        * @property {Object}  contactButton - Der Kontakt-Button. {on: true|false, email: string}. Default für email ist LGVGeoPortal-Hilfe@gv.hamburg.de
        * @property {Boolean}  tools - Die Werkzeuge
        * @property {Boolean}  treeFilter - Der Filter für die Straßenbäume.
        * @property {Boolean}  wfsFeatureFilter - Der WFS-Filter. Filterung entsprechend Eintrag in layerIDs{filterOptions}.
        * @property {Boolean}  legend - Die Legende
        * @property {Boolean}  routing - Wenn TRUE, wird in main.js views/RoutingView.js geladen. Möglichkeit der Routenberechnung.
        */
        menu: {
            viewerName: "Fluechtlingunterkuenfte HH",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        /**
        * @memberof config
        * @desc Konfiguration für die Suchfunktion. Workaround für IE9 implementiert.
        * @property {String}  placeholder - Der Text der initial in der Suchmaske steht.
        * @property {Function}  gazetteerURL - Die Gazetteer-URL.
        */
         searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Themen, Flurstück",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            tree: {
                minChars: 3
            },
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
            title: "",
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
            measure: false,
            print: true,
            coord: false,
            draw: false,
            active: "gfi",
            record: false
        },
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Ermöglicht über einen Button auf der Karter den aktuellen Standpunkt bestimmen zu lassen.
        */
        orientation: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Vorraussetzung für POI(Points of interest) ist, dass orientation auf true gesetzt ist. POI zeigt alle in der Nähe befindlichen Objekte von eingeschalteten WFS Diensten an in den Abständen 500, 1000 und 2000 Metern.
        */
        poi: false
    };

    return config;
});
