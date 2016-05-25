define(function () {
    var config = {
        tree: {
            type: "light",
            saveSelection: false,
            layer: [
                {id: "453", visibility: true, legendUrl: "ignore"},
                {id: "452", visibility: false},
                {id: "713", visibility: false,"name" :"Stadtplan S-W"},
                {id: "1993", visibility: true,"name" :"Fauna-Flora-Habitat-Gebiete"},
                {id: "1994", visibility: true,"name" :"Vogelschutzgebiete"},
                {id: "1999", visibility: true},
                {id: "1998", visibility: true},
                {id: "1992", visibility: true}
            ]
        },
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
           center: [565874, 5934140],
            resolution: 66.14579761460263,
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: true,
            fullScreen: true
        },
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
                    "alias_mobil": "LGV"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                    "alias": "SDP Download",
                    "alias_mobil": "SDP"
                },
                {
                    "bezeichnung": "",
                    "url": "http://www.hamburg.de/bsu/timonline",
                    "alias": "Kartenunstimmigkeit"
                }
            ]
        },
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
            }
        },
        menu: {
            helpButton: false,
            searchBar: true,
            layerTree: true,
            tools: true,
            featureLister: 10,
            treeFilter: false,
            wfsFeatureFilter: true,
            legend: true,
            routing: true,
            addWMS: true,
            formular: {}
        },
        startUpModul: "",
        searchBar: {
            minChars: 3,
            gazetteer: {
                minChars: 3,
               url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
           
            placeholder: "Suche nach Adresse / Stadtteil"
        },
        print: {
            printID: "99999",
            title: "Schutzgebietskarte",
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
            coord: {
                title: "Koordinate abfragen",
                glyphicon: "glyphicon-screenshot"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
