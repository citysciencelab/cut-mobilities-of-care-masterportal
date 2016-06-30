define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                //{id: "682", visible: true},
                //{id: "683", visible: false},
                {id: "753", name: "Kita Einrichtung", visibility: true, style: "753", searchField: "name", mouseHoverField: ["Name"]}
            ]
        },
        simpleMap: false,
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],// Rathausmarkt
            resolution: 66.14579761460263,
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "once",
            poi: true
        },
        customModules: [],
        footer: false,
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
            specialWFS: {
                minChar: 3,
                definitions: [
                    {
                        url: "/geofos/fachdaten_public/services/wfs_hh_kitaeinrichtung?service=WFS&request=GetFeature&version=2.0.0",
                        data: "typeName=app:KitaEinrichtungen",
                        name: "kita"
                    }
                ]
            },
            visibleWFS: {
                minChars: 3
            },
            placeholder: "Suche nach Adresse oder Kita-Namen",
            geoLocateHit: true
        },      
        print: {
            printID: "99999",
            title: "Kita-Stadtplan",
            gfi: false
        },
                  
         tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        },
         geoAPI: false,
        clickCounter: {},
    };

    return config;
});
