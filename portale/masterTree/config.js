define(function () {

    var config = {
       wfsImgPath: "..components/lgv-config/img",
       allowParametricURL: true,
       view: {
           center: [565874, 5934140] // Rathausmarkt
       },
       layerConf: "../components/lgv-config/services-fhhnet.json",
       restConf: "../components/lgv-config/rest-services-fhhnet.json",
       styleConf: "../components/lgv-config/style.json",
       print: {
           printID: "99999",
           title: "Master-Portal",
           gfi: false
       },
       proxyURL: "/cgi-bin/proxy.cgi",
       mouseHover: true,
       scaleLine: true,
       startUpModul: "",
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
                       url: "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                       data: "typeNames=prosin_festgestellt&propertyName=planrecht",
                       name: "bplan"
                   },
                   {
                       url: "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene?service=WFS&request=GetFeature&version=2.0.0",
                       data: "typeNames=prosin_imverfahren&propertyName=plan",
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
       gemarkungen: "../components/lgv-config/gemarkung.json"
   };

   return config;
});
