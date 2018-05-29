define(function () {

    var config = {

        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        // Bewirkt, dass das mmlMobileHEaderMenu geladen wird (wird nur in MML verwendet)
        mmlFullscreen: true,
        mmlMobileHeader: {
            url: "http://www.hamburg.de/melde-michel"
        },

        /**
        * @memberof config
        * @type String
        * @desc bei "attached" wird das GFI-Fenster am Klickpunkt angezeigt, bei jedem anderen String wird es als eigenes Fenster erzeugt. Wird das attribut nicht gesetzt wird der default "detached" verwendet
        */
        gfiWindow: "simpleLister",
        view: {},
        namedProjections: [
            ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
        ],
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
                    "alias_mobil": "LGV"
                }
            ]
        },
        quickHelp: false,
        imgPath: "../../components/lgv-config/img/",
        imgProjektPath: "../../img/",
        layerConf: "../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        mapMarkerModul: "dragMarker",
        wfsImgPath: "../components/lgv-config/img/"
    };

    return config;
});
