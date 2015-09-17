define(function () {

    var config = {

        wfsImgPath: "../components/lgv-config/img/",

        allowParametricURL: true,

        view: {
            center: [567108, 5928338], //Wilhelmsburger Insel
            extent: [454591, 5809000, 700000, 6075769],
            resolution: 15.875031750063500, //1: 60.000
            resolutions : [
                //66.145965625264583,
                26.458386250105834,
                15.875031750063500,
                10.583354500042333,
                5.2916772500211667,
                2.6458386250105834,
                1.3229193125052917,
                0.6614596562526458,
                0.2645838625010583,
                0.1322919312505292
            ],
            epsg: "EPSG:25832"
        },
        /**
        * customModules
        * @memberof config
        * @type {Array}
        * @desc lädt die Module
        */
        // customModules: ["customModule1", "customModule2"]

        footer: true,

        quickHelp: true,

        layerConf: "../components/lgv-config/services-fhhnet.json",

        restConf: "../components/lgv-config/rest-services-fhhnet.json",

        styleConf: "../components/lgv-config/style.json",

        categoryConf: "../components/lgv-config/category.json",

        proxyURL: "/cgi-bin/proxy.cgi",
        /**
        * @memberof config
        * @type {Object[]}
        * @property {String}  id - ID aus layerConf. Werden kommaseparierte ID übergeben, können WMS gemeinsam abgefragt werden.
        * @property {Boolean}  visible - Initiale Sichtbarkeit des Layers.
        * @property {String}  style - Nur bei WFS-Layern. Weist dem Layer den Style aus styleConf zu.
        * @property {String}  styles - Nur bei WMS-Layern. Fragt dem WMS mit eingetragenem Styles-Eintrag ab.
        * @property {Number}  clusterDistance - Nur bei WFS-Layern. Werte > 0 nutzen Clustering.
        * @property {String}  searchField - Nur bei WFS-Layern. Wenn searchField auf Attributnamen gesetzt, werden die entsprecheden Values in der Searchbar gesucht.
        * @property {String}  styleField - Nur bei WFS-Layern. Wenn styleField auf Attributname gesetzt, wird der jeweilge Wert für Style benutzt. styleConf muss angepasst werden.
        * @property {String}  styleLabelField - Nur bei WFS-Layern. Wenn styleLabelField auf Attributname gesetzt, wird der jeweilge Wert für Label verwendet. Style muss entsprechend konfiguriert sein.
        * @property {String}  mouseHoverField - Nur bei WFS-Layern. Wenn mouseHoverField auf Attributnamen gesetzt, stellt ein MouseHover-Event den Value als Popup dar.
        * @property {Object[]}  filterOptions - Nur bei WFS-Layern. Array aus Filterdefinitionen. Jede Filterdefinition ist ein Objekt mit Angaben zum Filter.
        * @property {String}  filterOptions.fieldName - Name des Attributes, auf das gefiltert werden soll.
        * @property {String}  filterOptions.filterType - Name des zulässigen Filtertyps. Derzeit nur combo.
        * @property {String}  filterOptions.filterName - Name des Filters in der Oberfläche.
        * @property {String}  filterOptions.filterString - Einträge des Filters, auf die gefiltert werden kann.
        * @property {String}  attribution - Setzt die Attributierung des Layers auf diesen String.
        * @property {Object}  attribution - Setzt die Attributierung des Layers in Abhängigkeit eines Events. Eine Funktion muss den Value "eventValue" am Layer setzen, um ihn zu übernehmen.
        * @property {String}  attribution.eventname - Name des Events, das abgefeuert wird.
        * @property {String}  attribution.timeout - Dauer in Millisekunden für setInterval.
        * @property {String}  opacity - Wert für die voreingestellte Transparenz für den Layer.
        * @property {String}  minScale -
        * @property {String}  maxScale -
        * @property {Boolean}   routable - Wert, ob dieser Layer beim GFI als Routing Destination ausgewählt werden darf. Setzt menu.routing == true vorraus.
        * @desc Beschreibung.
        */
        layerIDs: [
            {id: "452", visible: true},                         //Luftbild
            {id: "453", visible: false, legendUrl: "ignore"},   //Stadtplan
            {id: "2486", visible: true, name:"ohne Thema"},
            {id: "2482", visible: true, name:"Wirtschaft"},
            {id: "2483", visible: true, name:"Umwelt"},
            {id: "2477", visible: true, name:"Wohnen"},
            {id: "2478", visible: true, name:"Gewerbe"},
            {id: "2479", visible: true, name:"Natur"},
            {id: "2480", visible: true, name:"Sport"},
            {id: "2481", visible: true, name:"Bildung"},
            {id: "2484", visible: true, name:"Verkehr"},
            {id: "2485", visible: true, name:"Verfahren"}

        ],

        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,

        menu: {
            viewerName: "GeoViewer",
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

        startUpModul: "",

        searchBar: {
            placeholder: "Suche nach Adresse, Stadtteil",
            gazetteerURL: function () {
                    return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
        },

        print: {
            printID: "99999",
            title: "Zukunftsbild Elbinseln 2013",
            gfi: false
        },

        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: false,
            draw: false,
            active: "gfi"
        },

        orientation: true,

        poi: false
    };

    return config;
});
