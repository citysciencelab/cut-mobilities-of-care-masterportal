define(function () {
    var config = {
<<<<<<< HEAD
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
=======
        title: "Schutzgebietskarte",
>>>>>>> 2fdcac6d9be2003b4bd97f4c9fb207eb7e1252c7
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
<<<<<<< HEAD
           center: [565874, 5934140],
            resolution: 66.14579761460263,
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            fullScreen: true,
            poi: true
        },
        customModules: [],
=======
            background: "white",
            resolution: 66.14579761460263
             //center: [565686, 5942986] //Flughafen
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
        //customModules: ["../portale/master/verkehrsfunctions"],
>>>>>>> 2fdcac6d9be2003b4bd97f4c9fb207eb7e1252c7
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
<<<<<<< HEAD
                    "alias_mobil": "ttt"
=======
                    "alias_mobil": "SDP"
>>>>>>> 2fdcac6d9be2003b4bd97f4c9fb207eb7e1252c7
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
<<<<<<< HEAD
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
            title: "Lärmschutzbereiche Flughafen Hamburg",
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
        
=======
        proxyURL: "/cgi-bin/proxy.cgi",
        
        attributions: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",
        print: {
            printID: "99999",
            title: "Schutzgebietskarte",
            gfi: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
>>>>>>> 2fdcac6d9be2003b4bd97f4c9fb207eb7e1252c7
    };

    return config;
});
