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
        layerConf: locations.baseUrl + (locations.fhhnet ? '../diensteapiFHHNET.json' : '../diensteapiInternet.json'),
        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        styleConf: locations.baseUrl + '../style.json',
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
            {id: '452', visible: false},
            {id: '2028', visible: true},
            {id: '2029', visible: false},
            {id: '2030', visible: false},
            {id: '2031', visible: false},
            {id: '2032', visible: false},
			{id: '2033', visible: false},
			{id: '2034', visible: false},
			{id: '2035', visible: false},
			{id: '2036', visible: false},
			{id: '2037', visible: false},
			{id: '2038', visible: false},
			{id: '2039', visible: false},
			{id: '2040', visible: false},
			{id: '2041', visible: false}
			
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
            title: 'Master',
            gfi: false
        },
//        treeFilter: {
//            layer: '7777',
//            styleName: 'treefilter',
//            pathToSLD: 'http://wscd0096/master_sd/xml/treeFilterSLD.xml'
//        },
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
        poi: true
    }

    return config;
});
