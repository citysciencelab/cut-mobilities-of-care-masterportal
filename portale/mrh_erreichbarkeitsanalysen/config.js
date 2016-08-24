define(function () {
    var config = {
        wfsImgPath: "..components/lgv-config/img",
        title: "Erreichbarkeitsanalysen",
        logo: "../img/Logo_MRH_93x36.png",
        logoLink: "http://metropolregion.hamburg.de/",
        logoTooltip: "Metropolregion Hamburg",
        attributions: true,
        footer: {
            visibility: true,
            urls: [
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/kontakte.htm",
                        "alias": "Kontakte",
                        "alias_mobil": "Kontakte"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/copyright.htm",
                        "alias": "Copyright",
                        "alias_mobil": "Copyright"
                    },
                    {
                        "bezeichnung": "",
                        "url": "http://geoportal.metropolregion.hamburg.de/mrhportal_alt/fusszeile/links.htm",
                        "alias": "Linkliste",
                        "alias_mobil": "Linkliste"
                    }
            ]
        },
        allowParametricURL: true,
        view: {
            center: [565874, 5934140]
        },
        layerConf: "../components/lgv-config/services-mrh.json",
        restConf: "../components/lgv-config/rest-services-internet.json",
        styleConf: "../components/lgv-config/style.json",
        scaleLine: true,
        isMenubarVisible: true,
        startUpModul: "",
        searchBar: {
            minChars: 3,
            bkg: {
                minChars: 3,
                bkgSuggestURL: "/bkg_suggest",
                bkgSearchURL: "/bkg_geosearch",
                extent: [454591, 5809000, 700000, 6075769],
                epsg: "EPSG:25832",
                filter: "filter=(typ:*)",
                score: 0.6
            },
            visibleWFS: {
                minChars: 3
            },
            placeholder: "Suche nach Adresse",
            geoLocateHit: true
        },
        print: {
            printID: "99999",
            title: "Geoportal der Metropolregion Hamburg",
            outputFilename: "Ausdruck Geoportal GDI-MRH",
            gfi: false,
            configYAML: "gdimrh"
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
