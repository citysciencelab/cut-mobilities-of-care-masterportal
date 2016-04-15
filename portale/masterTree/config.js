define(function () {

    var config = {
       wfsImgPath: "..components/lgv-config/img",
       allowParametricURL: true,
       tree: {
           type: "custom"
        },
       view: {
           center: [565874, 5934140] // Rathausmarkt
       },
       controls: {
           zoom: true,
           toggleMenu: true,
           orientation: "once",
           poi: true
       },
       layerConf: "../components/lgv-config/services-fhhnet-olympia.json",
       restConf: "../components/lgv-config/rest-services-fhhnet.json",
       styleConf: "../components/lgv-config/style.json",
       print: {
           printID: "99999",
           title: "Master-Portal",
           gfi: false
       },
       proxyURL: "/cgi-bin/proxy.cgi",
       menubar: true,
       mouseHover: true,
       scaleLine: true,
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
           legend: true,
           routing: false
       },
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
               glyphicon: "glyphicon-envelope"
           }
       },
       startUpModul: "",
       searchBar: {
           gazetteer: {
               minChars: 3,
               url: "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0",
               searchStreets: true,
               searchHouseNumbers: true,
               searchDistricts: true,
               searchParcels: true
           },
           bkg: {
               minChars: 3,
               bkgSuggestURL: "/bkg_suggest",
               bkgSearchURL: "/bkg_geosearch",
               extent: [454591, 5809000, 700000, 6075769],
               epsg: "EPSG:25832",
               filter: "filter=(typ:*)",
               score: 0.6
           },
           specialWFS: {
               minChar: 3,
               definitions: [
                   {
                       url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                       data: "typeNames=hh_hh_planung_festgestellt&propertyName=planrecht",
                       name: "bplan"
                   },
                   {
                       url: "/geofos/fachdaten_public/services/wfs_hh_bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                       data: "typeNames=imverfahren&propertyName=plan",
                       name: "bplan"
                   }
               ]
           },
           visibleWFS: {
               minChars: 3
           },
           placeholder: "Suche nach Adresse/Krankenhaus/B-Plan",
           geoLocateHit: true
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
           }
       }
   };

   return config;
});
