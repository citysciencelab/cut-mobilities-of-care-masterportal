define(function () {
    var config = {
        
        tree: {
            type: "light",
            saveSelection: false,
            layer: [
                {id: "453", visibility: true, legendUrl: "ignore"}, 
                {id: "452", visibility: false},
                {id: "627", visibility: true},  //icons
                {id: "628", visibility: true},  //strecke
                {id: "629", visibility: false},  //umring
               //{id: "1132", visible: true, style: "1711", clusterDistance: 0, searchField: "", mouseHoverField: "name"}
               
            ]
        },
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: true,
            fullScreen: true
        },
        customModules: [],
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        
        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
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
            },            
            routing: {
                title: "Routenplaner",
                glyphicon: "glyphicon-road"
            }
        },
        
        menu: {
            helpButton: false,
            searchBar: true,
            layerTree: true,
             contact: {
                serviceID: "80001",
                from: [{
                    email: "lgvgeoportal-hilfe@gv.hamburg.de",
                    name: "LGVGeoportalHilfe"
                }],
                to: [{
                    email: "lgvgeoportal-hilfe@gv.hamburg.de",
                    name: "LGVGeoportalHilfe"
                }],
                ccToUser: true,
                cc: [],
                bcc: [],
                subject: "",
                textPlaceholder: "",
                includeSystemInfo: true
            },
            tools: true,
            featureLister: false,
            treeFilter: false,
            wfsFeatureFilter: true,
            
            
        },
        startUpModul: "",
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                suggestCount:10,
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=hh_hh_planung_festgestellt&propertyName=planrecht",
                        name: "bplan"
                    },
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeNames=imverfahren&propertyName=plan",
                        name: "bplan"
                    }
                ]
            },
            visibleWFS: {
                minChars: 3
            },
            layer: {
                minChar: 3
            },
            placeholder: "Suche nach Adresse"
        },
        print: {
            printID: "99999",
            title: "Stadtgrün",
            gfi: false
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
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            },
            draw: {
                title: "Zeichnen / Schreiben",
                glyphicon: "glyphicon-pencil"
            }
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
