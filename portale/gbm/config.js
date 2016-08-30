define(function () {

    var config = {
       wfsImgPath: "..components/lgv-config/img",
       allowParametricURL: true,
       view: {
           center: [565874, 5934140] // Rathausmarkt
       },
       layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
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
           placeholder: "Suche nach Adresse/Stadtteil"
       },
       gemarkungen: "../components/lgv-config/gemarkung.json"
   };

   return config;
});
