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
        layerConf: locations.baseUrl + '../diensteapiFHHNET.json',
        /**
        * @memberof config
        * @type {String}
        * @desc Beschreibung.
        */
        styleConf: locations.baseUrl  + '../style.json',
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
        mouseHover: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob die Menubar initial ausgeklappt ist oder nicht.
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
        * @desc Beschreibung
        * @property {String}  placeholder - Beschreibung.
        * @property {Function}  gazetteerURL - Beschreibung.
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
        * @desc Beschreibung
        * @property {String}  url - Beschreibung.
        * @property {String}  title - Beschreibung.
        * @property {Boolean}  gfi - Beschreibung.
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
