define(function () {

    var config = {
        title: "Eventlotse",
        logo: "../img/hh-logo.png",
        tree: {
            type: "light",
            layer: [
                {id: "453", visibility: true},// Stadtplan
                {id: "756", visibility: false, name: "Luftbild"},// Luftbild
                {id: "182", visibility: false},// Strassenbaumkataster
                {id: "582", visibility: false},// Parkanlagen
                {id: "629,628,627", name: "100 Jahre Stadtgrün", visibility: false},// 100JahreStadtgrün
                {id: "2030", visibility: false},// Naturschutzgebiete
                {id: "458", visibility: false},// Wasserschutzgebiete
                {id: "1754,1755,1756,1757,1758,1759", name: "Denkmalkartierung", visibility: false},// Denkmalkartierung
                {id: "1849", visibility: false, name: "Bodendenkmäler"},// Bodendenkmale
                {id: "1935", visibility: false, styles: "geofox-bahn", name: "HVV Bahnlinien"},// HVV Bahn
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
                 visible: false, name: "HVV Bus- und Fährenlinien", styles: ["geofox-bus", "geofox_BusName"]
                },// HVV Bus und Fähre
                {id: "1933", visibility: false, styles: "geofox_stations", name: "HVV Haltestellen"},// HVV Haltestellen
                {id: "945", visibility: false}, // Parkhäuser
                {id: "942", visibility: false}, // ParkAndRide
                {id: "4425", visibility: true, name:"Eventlotse-Flächen", style:"4425"} // WFS Eventlotse (4425)
//                {id: "4426", visibility: false, name:"Eventlotse-Flächen WMS"} // WMS Eventlotse (4426)
            ]
        },
        wfsImgPath: "../components/lgv-config/img/",
        allowParametricURL: true,
        zoomtofeature: {
            url: "http://geodienste.hamburg.de/Test_HH_WFST_Eventlotse",
            version:"2.0.0",
            typename: "app:hamburgconvention",
            literalprefix: "APP_HAMBURGCONVENTION_"
        },

        view: {
            center: [561210, 5932600],
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832"
        },
        controls: {
            zoom: true,
            toggleMenu: true,
            orientation: "allways",
            poi: false
        },
        footer: false,
        quickHelp: true,
        layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur json mit Druck- und WPS-Dienst
        */
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Style-Datei für die WFS-Dienste.
        */
        styleConf: "../components/lgv-config/style.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Konfig-Datei für den automatisiert generiereten Layerbaum
        */
        categoryConf: "../components/lgv-config/category.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Proxy-CGI
        */
        proxyURL: "/cgi-bin/proxy.cgi",
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/AttributionView.js geladen. Dieses Modul regelt die Darstellung der Layerattributierung aus layerConf oder layerIDs{attribution}.
        */
        attributions: false,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob das Portal eine Menüleiste(Navigationsleiste) haben soll oder nicht.
        */
        menubar: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/ScaleLineView.js geladen. Zeigt eine ScaleLine in der Map unten links an oder nicht. Benutze <div id="scaleLine" und <div id="scaleLineInner"></div>
        */
        scaleLine: true,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Wenn TRUE, wird in main.js views/MouseHoverPopupView.js geladen. Dieses Modul steuert die Darstellung des MouseHovers entsprechend layerIDs{mouseHoverField}
        */
        mouseHover: false,
        /**
        * @memberof config
        * @type {Boolean}
        * @desc Steuert, ob die Menubar initial ausgeklappt ist oder nicht.
        */
        isMenubarVisible: true,
        menu: {
            viewerName: "GeoViewer",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: {on: true, email: "LGVGeoPortal-Hilfe@gv.hamburg.de"},
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false,
            addWMS: false
            // featureLister: 20
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil",
            gazetteer: {
                minChars: 3,
                url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: false
            },
            geoLocateHit: true
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
            }
        }
    };

    return config;
});
