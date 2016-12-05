define(function () {
    /**
    * @namespace config
    * @desc Beschreibung
    */
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        tree: {
            type: "light",
            layer: [
                {id: '453', visible: true},
                {id: '94', visible: false},
                {id: '1119', visible: false},
                {id: '2028', visible: false, transparency: "40"},
                {id: '2029', visible: false, transparency: "30"},
                {id: '2039', visible: false, transparency: "40"},
                {id: '2030', visible: false, transparency: "10"},
                {id: '2031', visible: false, transparency: "10"},
                {id: '2032', visible: false, transparency: "10"},
    			{id: '2040', visible: false},
                {id: '2041', visible: true},
                {id: '2038', visible: false}
            ]
        },
        allowParametricURL: false,
        view: {
            center: [565874, 5934140]
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        proxyURL: '/cgi-bin/proxy.cgi',
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
        isMenubarVisible: true,
        menuItems: {
            tree: {
                title: "Themen",
                glyphicon: "glyphicon-list"
            },
            tools: {
                title: "Werkzeuge",
                glyphicon: "glyphicon-wrench"
            },
            legend: {
                title: "Legende",
                glyphicon: "glyphicon-book"
            },
            contact: {
                title: "Kontakt",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        startUpModul: '',
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true
            }
        },
        print: {
            printID: "99999",
            title: 'Gewässerunterhaltung',
            gfi: false
        },
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            print: {
                title: "Karte drucken",
                glyphicon: "glyphicon-print"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            fullScreen: true
        }
    }

    return config;
});
