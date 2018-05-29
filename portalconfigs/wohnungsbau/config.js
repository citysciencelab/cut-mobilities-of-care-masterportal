define(function () {
        var config = {
            ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
  tree: {
            type: "light",
            layer: [
                {id: "453", visibility: true, legendUrl: "ignore"},
                {id: "452", visibility: false},
                {id: "1886", visibility: false, name: "Bezirksgrenzen"},
                {id: "1724", visibility: false, name: "Fertiggestellte Wohnungen 2013"}, // fertiggest.whg.2013
                {id: "1530", visibility: false, name: "Ausgewählte Bauprojekte"}, // wohnungsbauproj.
                {id: "1173", visibility: false, name: "Genehmigte Wohnungen pro Bezirk"}, // baugen.hh
                {id: "1532", visibility: true, name: "Wohnbauflächenenpotentiale"},
                {id: "1417", visibility: true}, // gef.mietw.2011
                {id: "1418", visibility: true}, // gef.mietw.2012
                {id: "1419", visibility: true}, // gef.mietw.2013
                {id: "2130", visibility: true}, //  gef.mietw.2014
                {id: "4009", visibility: true} //  gef.mietw.2015
            ]
        },
        metadatenURL: "",
        wfsImgPath: "../node_modules/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            extent: [454591, 5809000, 700000, 6075769],
            resolution: 66.14579761460263, // 1:250 000
            resolutions: [
                66.14579761460263, // 1:250 000
                26.458319045841044, // 1:100 0000
                15.874991427504629, // 1:60 0000
                10.583327618336419, // 1:40 00000
                5.2916638091682096 // 1:20 0000
                // 2.6458319045841048 // 1:10 0000
                // 1.3229159522920524, // 1:5000
                // 0.6614579761460262, // 1:2500
                // 0.2645831904584105, // 1:1000
                // 0.13229159522920521 // 1:500
            ],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: false,
            poi: true
        },
        footer: {
            visibility: true,
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
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
        layerConf: "../node_modules/lgv-config/services-internet.json",
        restConf: "../node_modules/lgv-config/rest-services-internet.json",
        styleConf: "../node_modules/lgv-config/style.json",
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
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: false,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
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

            placeholder: "Suche nach Adresse / Stadtteil"
        },
        print: {
            printID: "99999",
            title: "Master",
            gfi: false
        },
        tools: {
            gfi: {
                title: "Informationen abfragen",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            }
        }
    };

    return config;
});
