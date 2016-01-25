define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true},     //Karte
            {id: "452", visible: false},    //Luftbild
            {id: "2425", visible: false},    //Stadtteile
            {id: "1933", visible: false},   //Haltestellen
            {id:
                [
                {id: "1935",name: "Bus1"},
                {id: "1935",name: "Bus2"}
                ],
                visible: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
            },

            {id: "1935", visible: false, styles: ["geofox_Faehre", "geofox-bahn"], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},

            {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"},

            {id: "2253", visible: false},   //Ärzte
            {id: "2254", visible: false},   //Zahnärzt
            {id: "2255", visible: false},   //Amb.Pflege
            {id: "2256", visible: false},   //Apotheken
            {id: "2257", visible: false},   //Baugenossenschaften
            {id: "2258", visible: false},   //Beratungsstellen
            {id: "2259", visible: false},   //Betr. Wohnen
            {id: "2260", visible: false},   //Krankenhäuser
            {id: "2261", visible: false},   //Krankenkassen
            {id: "2262", visible: false},   //Presse
            {id: "2263", visible: false},   //Seniorentreff
            {id: "2264", visible: false},   //Sport u. Beweg.
            {id: "2265", visible: false}    //Tagespflege
            ]
        },
        
        view: {
            center: [562674, 5940033],// Eimsbüttel
            resolution: 15.874991427504629, //1.60.00
            scale: 60000, // für print.js benötigt
            extent: [454591, 5809000, 700000, 6075769]
        },
        footer: true,
        quickHelp: true,
        layerConf:"../components/lgv-config/services-internet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        styleConf:"../components/lgv-config/style.json",
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
            legend: false,
            routing: false
        },
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: true
            },
            visibleWFS: {
                minChars: 3
            },
            placeholder: "Suche nach Adresse",
            geoLocateHit: true
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
        orientation: true,
        poi: true
    };

    return config;
});
