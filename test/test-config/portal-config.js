define(function () {

    var locations = {
        portal : window.location.protocol + '//' + window.location.host + window.location.pathname,
        baseUrl : require.toUrl(''),
        host : window.location.protocol + '//' + window.location.host,
        fhhnet : false
    };

    /**
    * @namespace config
    * @desc Beschreibung
    */
    var config = {
        locations: locations,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
        */
        allowParametricURL: false,
        /**
        * @memberof config
        * @desc Beschreibung
        * @property {Array}  center - Beschreibung.
        * @property {Number}  resolution - Beschreibung.
        * @property {Number}  scale - Beschreibung.
        */
        view: {
            center: [565874, 5934140],
            resolution: 15.874991427504629,
            scale: 60000 // für print.js benötigt
        },
        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        layerConf: '../test-config/diensteapiFHHNET.json',
        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        styleConf: '../test-config/style.json',

        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        categoryConf: '../test-config/category.json',
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
            {id: '94', visible: false},
            {id: '1119', visible: false},
            {id: '2028', visible: false, opacity: "40"},
            {id: '2029', visible: false, opacity: "30"},
            {id: '2039', visible: false, opacity: "40"},
            {id: '2030', visible: false, opacity: "10"},
            {id: '2031', visible: false, opacity: "10"},
            {id: '2032', visible: false, opacity: "10"},
            {id: '2040', visible: false},
            {id: '2041', visible: true},
            {id: '2038', visible: false}
        ],
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Beschreibung.
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
        isMenubarVisible: true,
        /**
        * @memberof config
        * @desc Beschreibung
        * @property {Boolean}  searchBar - Beschreibung.
        * @property {Boolean}  layerTree - Beschreibung.
        * @property {Boolean}  helpButton - Beschreibung.
        */
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        /**
        * @memberof config
        * @desc Beschreibung
        * @property {String}  placeholder - Beschreibung.
        * @property {Function}  gazetteerURL - Beschreibung.
        */
        searchBar: {
            placeholder: "Straße, Adresse",
            gazetteerURL: function () {
                if (locations.fhhnet) {
                    return locations.host + "/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
                }
                else {
                    return "http://geodienste-hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0";
                }
            }
        },
        /**
        * @memberof config
        * @desc Beschreibung
        * @property {String}  url - Beschreibung.
        * @property {String}  title - Beschreibung.
        * @property {Boolean}  gfi - Beschreibung.
        */
        print: {
            url: function () {
                if (locations.fhhnet) {
                    return locations.host + ":8680/mapfish_print_2.0/";
                }
                else {
                    return "http://geoportal-hamburg.de/mapfish_print_2.0/";
                }
            },
            title: 'Gewässerunterhaltung',
            gfi: false
        },
        /**
        * @memberof config
        * @desc Beschreibung
        * @property {Boolean}  gfi - Beschreibung.
        * @property {Boolean}  measure - Beschreibung.
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
        poi: false
    }

    return config;
});
