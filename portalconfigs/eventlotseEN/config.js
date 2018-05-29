define(function () {

    var config = {
//        title: "Eventlotse",
//        logo: "../img/hh-logo.png",
        tree: {
            type: "light",
            layer: [
                {id: "453", visibility: true, name: "City Map"},// Stadtplan
                {id: "756", visibility: false, name: "Aerial Imagery"},// Luftbild
                {id: "182", visibility: false, name: "Cadastre of Trees near Roads"},// Strassenbaumkataster
                {id: "582", visibility: false, name: "Parks"},// Parkanlagen
                {id: "629,628,627", name: "100 Years Urban Parks", visibility: false},// 100JahreStadtgrün
                {id: "1992", visibility: false, name: "Natural Reserve Areas"},// Naturschutzgebiete
                {id: "685", visibility: false, name: "Water Protection Areas"},// Wasserschutzgebietszonen
                {id: "1754,1755,1756,1757,1758,1759", name: "Memorial Mapping", visibility: false},// Denkmalkartierung
                {id: "2011", visibility: false, name: "Ground Memorials"},// Bodendenkmale
                {id: "1935", visibility: false, styles: "geofox-bahn", name: "Pub. Transp.(HVV) Trainlines"},// HVV Bahn
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
                 visible: false, name: "Pub. Transp.(HVV) Bus- and Ferrylines", styles: ["geofox-bus", "geofox_BusName"]
                },// HVV Bus und Fähre
                {id: "1933", visibility: false, styles: "geofox_stations", name: "Pub. Transp.(HVV) Stations"},// HVV Haltestellen
                {id: "945", visibility: false, name:"Car Parks"}, // Parkhäuser
                {id: "942", visibility: false, name:"Park And Ride"}, // ParkAndRide
                {id: "4561", visibility: true, name:"Eventlotse-Areas", featureCount: 2,
                    gfiAttributes: {
                        "flaechenname": "Name of space",
                        "bezirk": "District",
                        "flaeche_eventlotse_m": "Usable area",
                        "hinweisstempel_en": "Information",
                        "premiumflaeche": "Premium space",
                        "url_en": "Link to details"
                    }
                } // WMS Eventlotse (4426)
            ]
        },
        wfsImgPath: "/lgv-config/img/",
        allowParametricURL: true,
        zoomtofeature: {
            url: "http://geodienste.hamburg.de/HH_WFS_Eventlotse",
            version: "2.0.0",
            typename: "app:hamburgconvention",
            valuereference:"app:flaechenid",
            imglink: "../img/location_eventlotse.svg",
            layerid: "4561"
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
        quickHelp: false,
        layerConf: "/lgv-config/services-internet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur json mit Druck- und WPS-Dienst
        */
        restConf: "/lgv-config/rest-services-internet.json",
        /**
        * @memberof config
        * @type {String}
        * @desc Pfad zur Style-Datei für die WFS-Dienste.
        */
        styleConf: "/lgv-config/style.json",
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
        menuItems: {
            tree: {
                title: "Layers",
                glyphicon: "glyphicon-list"
            },
            tools: {
                title: "Tools",
                glyphicon: "glyphicon-wrench"
            },
            legend: {
                title: "Legend",
                glyphicon: "glyphicon-book"
            },
            contact: {
                title: "Contact",
                glyphicon: "glyphicon-envelope",
                email: "LGVGeoPortal-Hilfe@gv.hamburg.de"
            }
        },
        searchBar: {
            minChars: 3,
            placeholder: "Search for address and district",
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true,
                searchDistricts: true,
                searchParcels: false
            },
            geoLocateHit: true
        },
        tools: {
            gfi: {
                title: "get feature info",
                glyphicon: "glyphicon-info-sign",
                isActive: true
            },
            coord: {
                title: "get coordinates",
                glyphicon: "glyphicon-screenshot"
            },
            print: {
                title: "print map",
                glyphicon: "glyphicon-print"
            }
        },
        print: {
            printID: "99999",
            title: "Eventlotse",
            gfi: true
        }
    };

    return config;
});
