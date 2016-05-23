/*global define*/
define(function () {

    var config = {
        restConf: "../../components/lgv-config/rest-services-fhhnet.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        wpsID: "1001",
        minJahr: 1973,
        maxJahr: 2014,
        searchbar: {
            gazetteer: {
                minChars: 3,
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true
            },
            placeholder: "Suche nach Adresse (Straße/Hausnummer)",
            renderToDOM: "#adressfeld"
        }
    };

    return config;
});
