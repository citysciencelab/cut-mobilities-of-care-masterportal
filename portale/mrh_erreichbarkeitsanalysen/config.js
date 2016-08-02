define(function () {
    var config = {
        title: "Erreichbarkeitsanalysen",
        logo: "../img/Logo_MRH_93x36.png",
        logoLink: "http://metropolregion.hamburg.de/",
        logoTooltip: "Metropolregion Hamburg",
        tree: {
            type: "light",
            layer: [
                {id: "51", visibility: true}, // WebAtlas
                {id: "53", visibility: false}, // WebAtlas_grau
                {id: "55", visibility: false}, // Luftbilder
                {id: "57", visibility: false}, // 1:5000
                {id: "4646", visibility: false}, // Gewässer Erreichbarkeitsanalysen
                {id: "4748", visibility: false, styleable: true, geomType: "Polygon", attributesToStyle: ["EntfernungbiszumnaechstenBahnhof"]}, // Erreichbarkeitsanalysen
                {id: "4749", visibility: false, styleable: true, geomType: "Polygon", attributesToStyle: ["ZeitmitdemRadbiszurnaechstenGrundschule"]}, // Erreichbarkeitsanalysen
                {id: "4750", visibility: false, styleable: true, geomType: "Polygon", attributesToStyle: ["EntfernungbiszumnaechstenRadschnellweg"]}, // Erreichbarkeitsanalysen
                {id: "4751", visibility: false, styleable: true, geomType: "Polygon", attributesToStyle: ["ErreichbareArbeitsplaetzein60Min"]}, // Erreichbarkeitsanalysen
                {id: "4752", visibility: false, styleable: true, geomType: "Polygon", attributesToStyle: ["ErreichbareArbeitsplaetzein30Min"]}, // Erreichbarkeitsanalysen
                {id: "4753", visibility: false, styleable: true, geomType: "Polygon", attributesToStyle: ["ErreichbareArbeitsplaetzeohneUmstieg"]}, // Erreichbarkeitsanalysen
                {id: "4643", visibility: false}, // Bahnnetz Erreichbarkeitsanalysen
                {id: "4642", visibility: false}, // Bahnstationen Erreichbarkeitsanalysen
                {id: "4647", visibility: false}, // Grenze der Metropolregion Erreichbarkeitsanalysen
                {id: "4648", visibility: false} // Grundschule Erreichbarkeitsanalysen
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once"
        },
        attributions: true,
        footer: {
            visibility: true,
            urls: [
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/kontakte.htm",
                        "alias": "Kontakte",
                        "alias_mobil": "Kontakte"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/copyright.htm",
                        "alias": "Copyright",
                        "alias_mobil": "Copyright"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/links.htm",
                        "alias": "Linkliste",
                        "alias_mobil": "Linkliste"
                    }
            ]
        },
        quickHelp: false,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769], // extent aus altem portal erzeugt fehler im webatlas und suchdienst
            resolution: 76.43718115953851,
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
        layerConf: "../components/lgv-config/services-mrh.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "Geoportal GDI-MRH",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
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
            }
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suchen nach Adresse, Thema",
            bkg: {
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                suggestCount: 100
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
            searchByCoord: {
               title: "Koordinatensuche",
               glyphicon: "glyphicon-search"
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
