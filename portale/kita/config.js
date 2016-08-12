define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                //{id: "682", visible: true},
                //{id: "683", visible: false},
                {id: "753", name: "Kita Einrichtung", visibility: true, style: "753", clusterDistance: 0, searchField: "name", mouseHoverField: ["Name"], 
                    filterOptions: [
                        {
                            fieldName: "Bezirk",
                            filterType: "combo",
                            filterName: "Bezirk",
                            filterString: ["*", "Altona", "Bergedorf", "Eimsbüttel", "Hamburg-Mitte", "Hamburg-Nord", "Harburg", "Wandsbek"]
                        }
                    ], styleLabelField: "", styleField: ""}
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
            poi: true,
            wfsFeatureFilter: true
        },
        customModules: [],
        footer: false,
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
            wfsFeatureFilter: {
                title: "Filter öffnen",
                glyphicon: "glyphicon-filter"
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
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            specialWFS: {
                minChar: 2,
                definitions: [
                    {
                        url: "/geodienste_hamburg_de/HH_WFS_KitaEinrichtung",
                        data: "service=WFS&request=GetFeature&version=2.0.0&typeNames=app:KitaEinrichtungen&propertyName=app:Name,app:geom",
                        name: "kita"
                    }
                ]
            },
            placeholder: "Suche nach Adresse, Stadtteil oder Kita-Namen",
            geoLocateHit: true,
            minChars: 3
        },
        print: {
            printID: "99999",
            title: "Kita-Stadtplan",
            gfi: false
        },

        tools: {
            parcelSearch: {
                title: "Flurstückssuche",
                glyphicon: "glyphicon-search"
            },
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
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
