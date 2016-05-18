define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "95", visible: false, name:"Lärm Straßenverkehr Nacht 2012"},     //Lärm_night_2012
                {id: "96", visible: false, name:"Lärm Straßenverkehr Tag 2012"}      //Lärm_den_2012
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
            orientation: "once",
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
                    "alias_mobil": "ttt"
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
        categoryConf: "../components/lgv-config/category.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        
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
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            visibleWFS: {
                minChars: 3
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
        },
        orientation: true,
       
        poi: false
    };

    return config;
});
