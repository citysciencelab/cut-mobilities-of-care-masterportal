define(function () {

    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visibility: true},
                {id: "452", visibility: false},
                {id: "2092", visibility: false},
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
                 name: "Verkehrslage auf Autobahnen", visibility: false
                },
                {id: "1935", visibility: false, styles: ["geofox_Faehre", "geofox-bahn"], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},
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
                {id: "1933", visibility: false, styles: "geofox_stations", name: "HVV Haltestellen"},
                {id: "676", visibility: false, name: "Positivnetz Lang-LKW"},
                {id: "46", visibility: false, style: "46", clusterDistance: 60, searchField: "", mouseHoverField: "", filterOptions: [], routable: true},
                {id: "48", visibility: false, style: "48", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "50", visibility: false, style: "50", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "53", visibility: false, style: "53", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "2404", visibility: false, style: "45", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "2403", visibility: false, style: "51", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
                {id: "52", visibility: false, style: "52", clusterDistance: 30, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", styleField: "situation", routable: true},
                {id: "2128", visibility: false, style: "2128", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
                {id: "47", visibility: true, style: "47", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "id_kost", styleField: "typ", routable: false},
                {id: "2156", visibility: true, style: "2156", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", styleField: "name", routable: false},
                {id: "2714", gfiTheme: "reisezeiten", visibility: false, style: "2119", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
                {id: "2132", visibility: false, style: "2132", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
                {id: "2713", visibility: false, displayInTree: false},
                {id: "2715", visibility: false, displayInTree: false}
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
            orientation: "allways",
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
            addWMS: false,
            featureLister: 20
        },
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
            },
            routing: {
                title: "Routenplaner",
                glyphicon: "glyphicon-road"
            },
            featureLister: {
                title: "test",
                glyphicon: "glyphicon-plus",
                lister: 10
            }
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
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            }
        }
    };

    return config;
});
