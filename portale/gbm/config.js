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
       gemarkungen: "../components/lgv-config/gemarkung.json"
   };

   return config;
});
