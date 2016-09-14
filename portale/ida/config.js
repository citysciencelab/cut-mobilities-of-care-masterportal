/*global define*/
define(function () {

    var config = {
        restConf: "../../components/lgv-config/rest-services-fhhnet.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        wpsID: "1002",
        minJahr: 1974,
        maxJahr: 2016,
        jahreText: "Die aktuellsten Daten beziehen sich auf das Jahr 2015. Für den Bodenrichtwert zum 31.12.2015 wählen Sie bitte das Jahr 2016.",
        searchBar: {
            gazetteer: {
                url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
                searchStreets: true,
                searchHouseNumbers: true
            },
            minChars: 3,
            placeholder: "Suche nach Adresse (Straße/Hausnummer)",
            renderToDOM: "#adressfeld"
        }
    };

    return config;
});
