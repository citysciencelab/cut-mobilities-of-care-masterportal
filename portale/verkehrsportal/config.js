define(function () {

    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "452", visible: false},
                {id: "2092", visible: false},
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
                 name: "Verkehrslage auf Autobahnen", visible: false
                },
                {id: "1935", visible: false, styles: ["geofox_Faehre", "geofox-bahn"], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},
                {id:
                 [
                    {
                        id: "1935",
                        name: "Bus1"
                    },
                    {
                        id: "1935",
                        name: "Bus2"
                    }
                 ],
                 visible: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
                },
                {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"},
                {id: "676", visible: false, name: "Positivnetz Lang-LKW"},
                {id: "46", visible: false, style: "46", clusterDistance: 60, searchField: "", mouseHoverField: "", filterOptions: [], routable: true},
                {id: "48", visible: false, style: "48", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "50", visible: false, style: "50", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "53", visible: false, style: "53", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "2404", visible: false, style: "45", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "2403", visible: false, style: "51", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "52", visible: false, style: "52", clusterDistance: 30, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", styleField: "situation", routable: true},
                {id: "2128", visible: false, style: "2128", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
                {id: "47", visible: true, style: "47", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "id_kost", styleField: "typ", routable: false},
                {id: "2156", visible: true, style: "2156", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", styleField: "name", routable: false},
                {id: "2714", gfiTheme: "reisezeiten", visible: false, style: "2119", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
                {id: "2132", visible: false, style: "2132", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
                {id: "2713", visible: false, displayInTree: false},
                {id: "2715", visible: false, displayInTree: false}
            ]
        },
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [561210, 5932600],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: true
        },
        customModules: ["../portale/verkehrsportal/verkehrsfunctions"],
        footer: false,
        quickHelp: true,
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
        mouseHover: false,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob die Menubar initial ausgeklappt ist oder nicht.
        */
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
            routing: true,
            addWMS: false
        },
        startUpModul: "",
        clickCounter: {
            version: "",
            desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobil: "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
        },
        searchBar: {
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            placeholder: "Suche nach Adresse",
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Ausdruck aus dem Verkehrsportal",
            gfi: false
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
            coord: true,
            draw: false,
            active: "gfi"
        }
    };

    return config;
});
