define([
    "backbone",
    "underscore",
    "openlayers",
    "eventbus",
    "config"
], function (Backbone, _, ol, Eventbus, Config) {
    var FooterModel = Backbone.Model.extend({
        defaults: {
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoniformation und Vermessung",
                    "alias_mobil": "LGV Hamburg"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
                    "alias": "SDP Download"
                },
                {
                    "bezeichnung": "",
                    "url": "http://www.hamburg.de/bsu/timonline",
                    "alias": "Kartenunstimmigkeit"
                },
                {
                    "bezeichnung": "",
                    "url": "http://geofos.fhhnet.stadt.hamburg.de/fhh-atlas_alt/",
                    "alias": "Zum alten FHH-Atlas"
                }
            ]
        },
        initialize: function () {
            if (!_.isUndefined(Config.footer.urls)) {
                var urls = Config.footer.urls;

                if (!_.isUndefined(urls[0].bezeichnung) &&
                !_.isUndefined(urls[0].url) &&
                !_.isUndefined(urls[0].alias)) {
                    this.set("urls", urls);
                }
            }

        }
    });

return new FooterModel();

});
