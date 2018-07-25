define(function (require) {
    var Config = require("config"),
        FooterModel;

    FooterModel = Backbone.Model.extend({
        defaults: {
            urls: [
                {
                    "bezeichnung": "Kartographie und Gestaltung: ",
                    "url": "http://www.geoinfo.hamburg.de/",
                    "alias": "Landesbetrieb Geoinformation und Vermessung",
                    "alias_mobil": "LGV Hamburg"
                }
            ]
        },
        initialize: function () {
            var urls;

            if (!_.isUndefined(Config.footer.urls)) {
                urls = Config.footer.urls;

                if (!_.isUndefined(urls[0].bezeichnung) &&
                !_.isUndefined(urls[0].url) &&
                !_.isUndefined(urls[0].alias)) {
                    this.set("urls", urls);
                }
            }

        }
    });

    return FooterModel;
});
