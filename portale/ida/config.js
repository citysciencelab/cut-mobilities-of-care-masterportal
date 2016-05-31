/*global define*/
define(function () {

    var config = {
        restConf: "../../components/lgv-config/rest-services-fhhnet.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        wpsID: "1001",
        minJahr: 1974,
        maxJahr: 2015,
        jahreText: "Die aktuellsten Daten beziehen sich auf das Jahr 2014. Für den Bodenrichtwert zum 31.12.2014 wählen Sie bitte das Jahr 2015.",
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
