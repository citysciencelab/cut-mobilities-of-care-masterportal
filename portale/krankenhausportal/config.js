/*global define*/
define(function () {

    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},
                {id: "452", visible: false},
                {id: "1711", visible: true, style: "1711", clusterDistance: 0, searchField: "name", mouseHoverField: "name",
                 attribution: "<strong><a href='http://www.tagesschau.de/' target='_blank'>Weitere Informationen</a></strong>",
                 displayInTree: true,
                 filterOptions: [
                     {
                         "fieldName": "teilnahme_geburtsklinik",
                         "filterType": "combo",
                         "filterName": "Geburtshilfe",
                         "filterString": ["*", "ja", "nein"]
                     },
                     {
                         "fieldName": "teilnahme_notversorgung",
                         "filterType": "combo",
                         "filterName": "Not- und Unfallversorgung",
                         "filterString": ["*", "ja", "eingeschränkt", "nein"]
                     }
                 ]
                }
            ]
        },
        wfsImgPath: "../components/lgv-config/img/",
        view: {
            center: [565874, 5934140] // Rathausmarkt
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        attributions: false,
        allowParametricURL: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: true,
            legend: false,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche nach Straße oder Krankenhausname",
            gazetteer: {
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true
            },
            visibleWFS: {
                minChars: 3
            },
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Krankenhäuser in Hamburg",
            gfi: true
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
            searchByCoord: {
                title: "Koordinatensuche",
                glyphicon: "glyphicon-record"
            },
            measure: {
                title: "Strecke / Fläche messen",
                glyphicon: "glyphicon-resize-full"
            }
        }
    }
    return config;
});
