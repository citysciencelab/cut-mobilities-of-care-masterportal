/*global define*/
define(function () {

    var config = {
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"],
        restConf: "../../lgv-config/rest-services-fhhnet.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        wpsID: "1002",
        netcheckerURL: "https://test.geoportal-hamburg.de/ida/php/netchecker.php",
        downloaderURL: "https://test.geoportal-hamburg.de/ida/php/download.php",
        loggerDB_INSERT_URL: "/ida/php/loggerdb_insert.php",
        loggerDB_UPDATE_URL: "/ida/php/loggerdb_update.php",
        loggerDB_SELECT_URL: "/ida/php/loggerdb_select.php",
        minJahr: 1974,
        maxJahr: 2018,
        jahreText: "Die aktuellsten Daten beziehen sich auf das Jahr 2017.</br>Für den Bodenrichtwert zum 31.12.2017 wählen Sie bitte das Jahr 2018.",
        searchBar: {
            gazetteer: {
                "serviceId": "6",
                searchStreets: true,
                searchHouseNumbers: true
            },
            minChars: 3,
            placeholder: "Suche nach Adresse (Straße/Hausnummer)",
            renderToDOM: "#adressfeld"
        },
        parcelSearch: {
            serviceId: "6",
            StoredQueryID: "Flurstueck",
            configJSON: "../../lgv-config/gemarkungen_hh.json",
            parcelDenominator: false,
            renderToDOM: "#parcelSearchField"
        },
        contact: {
            serviceId: "80001",
            subject: "Fragen zu IDA.HH der ImmobilienwertDatenAuskunft Hamburg",
            ccToUser: true,
            bedienungsanleitung: "https://www.hamburg.de/contentblob/9161092/data/d-ida-bedienungsanleitung.pdf",
            musterAuskunft: "https://www.hamburg.de/contentblob/10287442/data/d-auszug-aus-ida-hh-muster.pdf",
            gebuehr: "https://www.hamburg.de/contentblob/10275842/data/d-gebuehrenbescheid-muster.pdf",
            fachlicheErlaeuterung: "https://www.hamburg.de/bsw/grundstueckswerte/nofl/8024830/d-ida-erlaeuterungen",
            glossar: "https://www.hamburg.de/contentblob/8779896/data/d-glossar-imb-2017.pdf",
            datenschutzerklaerung: "https://www.hamburg.de/contentblob/10287416/data/d-ida-datenschutzerklaerung.pdf",
            nutzungsbedingungen: "https://www.hamburg.de/contentblob/6759970/data/d-nutzungsbedingungen.pdf",
            gebuehrenordnung: "https://www.hamburg.de/contentblob/6759966/data/d-gebuehrenordnung.pdf",
            impressum: "https://www.hamburg.de/bsw/impressum-lgv"
        },
        priceInfo: "16 € (mehrwertsteuerfrei)"
    };

    return config;
});
