define(function () {
    var config = {
        title: "Geoportal München",
        logo: "http://www.unterdarchinger-musi.de/wp-content/uploads/2011/10/muenchen.svg_.png",
        logoLink: "https://www.muenchen.de",
        logoTooltip: "Stadtportal Hamburg",
        tree: {
            type: "custom",
            customConfig: "../portale/muenchen/tree-config.json",
            saveSelection: true
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            mousePosition: true,
            orientation: "allways"
        },
        simpleMap: true,
        attributions: true,
        footer: {
            visibility: true
        },
        quickHelp: false,
        allowParametricURL: true,
        view: {
            epsg: "EPSG:31468",
            center: [4466880, 5334951],
            // extent: [454591, 5809000, 700000, 6075769], // extent aus altem portal erzeugt fehler im webatlas und suchdienst
            resolution: 152.87436231907702,
            options: [
                {
                    resolution: 611.4974492763076,
                    scale: "2311167",
                    zoomLevel: 0
                },
                {
                    resolution: 305.7487246381551,
                    scale: "1155583",
                    zoomLevel: 1
                },
                {
                    resolution: 152.87436231907702,
                    scale: "577791",
                    zoomLevel: 2
                },
                {
                    resolution: 76.43718115953851,
                    scale: "288896",
                    zoomLevel: 3
                },
                {
                    resolution: 38.21859057976939,
                    scale: "144448",
                    zoomLevel: 4
                },
                {
                    resolution: 19.109295289884642,
                    scale: "72223",
                    zoomLevel: 5
                },
                {
                    resolution: 9.554647644942321,
                    scale: "36112",
                    zoomLevel: 6
                },
                {
                    resolution: 4.7773238224711605,
                    scale: "18056",
                    zoomLevel: 7
                },
                {
                    resolution: 2.3886619112355802,
                    scale: "9028",
                    zoomLevel: 8
                },
                {
                    resolution: 1.1943309556178034,
                    scale: "4514",
                    zoomLevel: 9
                },
                {
                    resolution: 0.5971654778089017,
                    scale: "2257",
                    zoomLevel: 10
                }
            ]
        },
        layerConf: "../portale/muenchen/services.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: true,
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
        startUpModul: "",
        searchBar: {
            minChars: 3,
            placeholder: "Suchen nach Adresse, Thema",
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [4386596, 5237914, 4613610, 6104496],
                epsg: "EPSG:31468",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            tree: {
                minChars: 3
            },
            geoLocateHit: true
        },
        tools: {
            gfi: {
              title: "Informationen abfragen",
               glyphicon: "glyphicon-info-sign",
               isActive: true
            },
            print: {
                title: "Karte drucken",
                glyphicon: "glyphicon-print"
            },
            coord: {
               title: "Koordinate abfragen",
               glyphicon: "glyphicon-screenshot"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
            draw: {
                title: "Zeichnen",
                glyphicon: "glyphicon-pencil"
            },
            kmlimport: {
                title: "KML Import",
                glyphicon: "glyphicon-import"
            }
        },
        print: {
            printID: "99999",
            title: "Geoportal der Metropolregion Hamburg",
            outputFilename: "Ausdruck Geoportal GDI-MRH",
            gfi: false,
            configYAML: "gdimrh"
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
