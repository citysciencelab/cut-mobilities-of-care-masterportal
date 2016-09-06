define(function () {

    var config = {
       wfsImgPath: "..components/lgv-config/img",
       allowParametricURL: true,
       view: {
           center: [566770, 5935620], // Alster
           resolution: 2.6458319045841048 // 1: 10 000
       },
       layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
       restConf: "../components/lgv-config/rest-services-fhhnet.json",
       styleConf: "../components/lgv-config/style.json",
       print: {
           printID: "99999",
           title: "Grundstücksbezogene Fachinformationen",
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
           tree: {
               minChars: 3
           },
           placeholder: "Suche Adresse/ Stadtteil/ Thema",
           geoLocateHit: true
       },
       gemarkungen: "../components/lgv-config/gemarkung.json"
   };

   return config;
});
