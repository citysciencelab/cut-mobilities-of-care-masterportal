define(function () {
    var config = {
        tree: {
            type: "light",
            layer: [
                {id: "453", visible: true, legendUrl: "ignore"},
                {id: "452", visible: false},
                {id: "21", visible: false},
                {id: "22", visible: false},
                {id: "23", visible: false},
                {id: "24", visible: false},
                {id: "25", visible: false},
                {id: "1556", visible: false},
                {id: "1557", visible: false},
                {id: "1558", visible: false},
                {id: "1559", visible: false},
                {id: "1949", visible: false},
                {id: "1950", visible: false},
                {id: "1951", visible: false},
                {id: "1952", visible: false},
                {id: "979", visible: false},
                {id: "1007", visible: false},
                {id: "1020", visible: false},
                {id: "1933", visible: false},   //Haltestellen
            {id:
                [
                {id: "1935",name: "Bus1"},
                {id: "1935",name: "Bus2"}
                ],
                visible: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
            },

            {id: "1935", visible: false, styles: ["geofox_Faehre", "geofox-bahn"], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},

            {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"}
            ]
        },
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [565874, 5934140],
            resolution: 66.14579761460263, // 1:250.000
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: false
        },
        customModules: [],
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-verkehrsmodell.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        menubar: true,
        scaleLine: true,
        mouseHover: true,
        isMenubarVisible: true,
        menu: {
            helpButton: false,
            searchBar: true,
            layerTree: true,
            contactButton: {on: false, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: false,
            addWMS: false,
            formular: {}
        },
        startUpModul: "",
        searchBar: {
            gazetteer: {
                minChars: 3,
                url: "/geodienste-hamburg/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
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
            title: "Verkehrsmodul",
            gfi: false
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: true,
            parcelSearch: false,
            active: "gfi",
            record: false
        },
        geoAPI: false,
        clickCounter: {},
        gemarkungen: "../components/lgv-config/gemarkung.json"
    };

    return config;
});
