define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visibility: true},     //Karte
            {id: "452", visibility: false},    //Luftbild
            {id: "2425", visibility: false},    //Stadtteile
            {id: "1933", visibility: false},   //Haltestellen
            {id:
                [
                {id: "1935",name: "Bus1"},
                {id: "1935",name: "Bus2"}
                ],
                visibility: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
            },

            {id: "1935", visibility: false, styles: ["geofox_Faehre", "geofox-bahn"], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},

            {id: "1933", visibility: false, styles: "geofox_stations", name: "HVV Haltestellen"},

            {id: "2253", visibility: false},   //Ärzte
            {id: "2254", visibility: false},   //Zahnärzt
            {id: "2255", visibility: false},   //Amb.Pflege
            {id: "2256", visibility: false},   //Apotheken
            {id: "2257", visibility: false},   //Baugenossenschaften
            {id: "2258", visibility: false},   //Beratungsstellen
            {id: "2259", visibility: false},   //Betr. Wohnen
            {id: "2260", visibility: false},   //Krankenhäuser
            {id: "2261", visibility: false},   //Krankenkassen
            {id: "2262", visibility: false},   //Presse
            {id: "2263", visibility: false},   //Seniorentreff
            {id: "2264", visibility: false},   //Sport u. Beweg.
            {id: "2265", visibility: false}    //Tagespflege
            ]
        },

        view: {
            center: [562674, 5940033],// Eimsbüttel
            resolution: 15.874991427504629, //1.60.00
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
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
        isMenubarvisibility: true,
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

            placeholder: "Suche nach Adresse"
        },
        print: {
            printID: "99999",
            title: "Gesundheits- & Pflegekonferenz Eimsbüttel",
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
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once"
        }
    };

    return config;
});
