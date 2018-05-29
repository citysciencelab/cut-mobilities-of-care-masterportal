define(function () {
    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        allowParametricURL: true,
        view: {
            center: [571174, 5929140], // Rathausmarkt
            resolution: 5.2916638091682096 // 1:20.000
        },
        layerConf: "../node_modules/lgv-config/services-fhhnet.json",
        restConf: "../node_modules/lgv-config/rest-services-fhhnet.json",
        styleConf: "../node_modules/lgv-config/style.json",
        tree: {
            type: "light",
            layer: [
            {id: "453", visible: true},
            {id: "94", visible: false},
            {id: "1935", visible: false, styles: ["geofox-bus", "geofox_BusName", "geofox-bahn"], name: ["HVV Buslinien", "HVV Buslinin Nummern", "HVV Bahnlinien"]},
            {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"},
            {id: "2284,2401", visible: true, name: "Lehrpfad"},
            {id: "2283,2402", visible: true, name: "Tafeln"}
            ]
        },
        controls: {
            zoom: true,
            toggleMenu: true
        },
        menubar: true,
        mouseHover: false,
        scaleLine: true,
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
            contact: {
                title: "Kontakt",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        searchBar: {
            minChars: 3,
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            }
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
            },
            draw: {
                title: "Zeichnen / Schreiben",
                glyphicon: "glyphicon-pencil"
            }
        },
        print: {
            printID: "99997",
            title: "Bodenschutz-Portal",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
