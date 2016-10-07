define(function () {
    
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        title: "Mein Baum - Meine Stadt",
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
       
        view: {
            background: "white",
            resolution: 66.14579761460263 // 1: 250 000
           /* center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
            */
        },
       // customModules: [" "],
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
        layerConf: "../components/lgv-config/services-fhhnet-All.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        
        attributions: true,
        // menubar: true,
       
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        startUpModul: "",
        /**
        * @memberof config
        * @type {Object}
        * @desc Konfiguration für den Druckdienst.
        * @property {String}  printID - ID des Druckdienstes in der restServices.json. Siehe {@link config.restConf}.
        * @property {String}  title - Der Titel erscheint auf dem Ausdruck der Karte.
        * @property {Boolean}  gfi - Gibt an, ob nur die Karte oder auch geöffnete GFI-Informationen ausgedruckt werden sollen.
        */
        print: {
            printID: "99999",
            title: "Mein Baum - Meine Stadt",
            gfi: true
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
