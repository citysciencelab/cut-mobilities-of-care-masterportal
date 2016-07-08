define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "95", visible: false, name: "Lärm Straßenverkehr Nacht 2012"},     //Lärm_night_2012
                {id: "96", visible: false, name: "Lärm Straßenverkehr Tag 2012"}      //Lärm_den_2012
            ]
        },
        view: {
            center: [565874, 5934140],  //Rathaus
            resolution: 15.874991427504629, //1.60.000
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "allways",
            poi: false
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
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
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
            placeholder: "Suche nach Adresse, Stadtteil",
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Lärmkarte-Straßenverkehr",
            gfi: false
        },
        tools: {
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
        }
    };

    return config;
});
