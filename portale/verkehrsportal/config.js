define(function () {
    var config = {
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        view: {
            center: [561210, 5932600],
            extent: [454591, 5809000, 700000, 6075769]
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        customModules: ["../portale/verkehrsportal/verkehrsfunctions"],
        layerIDs: [
            {id: "453", visible: true},
            {id: "452", visible: false},
            {id: "2092", visible: false},
            {id:
             [
                 {
                     id: "946",
                     attribution:
                     {
                         eventname: "aktualisiereverkehrsnetz",
                         timeout: (10 * 60000)
                     }
                 },
                 {
                     id: "947"
                 }
             ],
             name: "Verkehrslage auf Autobahnen", visible: false
            },
            {id: "1935", visible: false, styles: ["geofox_Faehre", "geofox-bahn"], name: ["HVV Fährverbindungen", "HVV Bahnlinien"]},
            {id:
             [
                {
                    id: "1935",
                    name: "Bus1"
                },
                {
                    id: "1935",
                    name: "Bus2"
                }
             ],
             visible: false, name: "HVV Buslinien", styles: ["geofox-bus", "geofox_BusName"]
            },
            {id: "1933", visible: false, styles: "geofox_stations", name: "HVV Haltestellen"},
            {id: "676", visible: false, name: "Positivnetz Lang-LKW"},
            {id: "46", visible: false, style: "46", clusterDistance: 60, searchField: "", mouseHoverField: "", filterOptions: [], routable: true},
            {id: "48", visible: false, style: "48", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
            {id: "50", visible: false, style: "50", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
            {id: "53", visible: false, style: "53", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
            {id: "2404", visible: false, style: "45", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
            {id: "2403", visible: false, style: "51", clusterDistance: 40, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", routable: true},
            {id: "52", visible: false, style: "52", clusterDistance: 30, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", styleField: "situation", routable: true},
            {id: "2128", visible: false, style: "2128", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
            {id: "47", visible: false, style: "47", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "id_kost"},
            {id: "2156", visible: true, style: "2156", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: "", styleField: "name", routable: false},
            {id: "2714", gfiTheme: "reisezeiten", visible: false, style: "2119", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
            {id: "2132", visible: false, style: "2132", clusterDistance: 0, searchField: "", mouseHoverField: "", filterOptions: [], styleLabelField: ""},
            {id: "2713", visible: false, displayInTree: false},
            {id: "2715", visible: false, displayInTree: false}
        ],
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: true,
            poi: true
        },
        attributions: true,
        clickCounter: {
            version: "",
            desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html",
            mobil : "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
        },
        menubar: true,
        scaleLine: true,
        mouseHover: false,
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: false,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: false,
            routing: true
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Adresssuche",
            bkg: {
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch"
            },
            geoLocateHit: true
        },
        tools: {
            gfi: true,
            measure: true,
            print: false,
            draw: false,
            coord: true,
            record: false,
            active: "gfi"
        },
        gfiImgReloadTime: 20000
    }

    return config;
});
