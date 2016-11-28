define([
    "underscore",
    "backbone"
], function (_, Backbone) {
    "use strict";
    var CheckURLModel = Backbone.Model.extend({
        defaults: {
        },
        initialize: function () {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1).toUpperCase(), // URL --> alles nach ? wenn vorhanden
                result = {};

            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });

            /**
             * Hier wird geprüft, ob eine Berechnung bereits erfolgt ist.
             */
            if (_.has(result, "FILEPATH") === true) {
                require(["idaModules/6_end/download/view"], function (DownloadView) {
                    new DownloadView (_.values(_.pick(result, "FILEPATH"))[0]);
                });
            }
            else {
                require(["idaModules/1_queries/view"]);
            }
        }
    });

    return new CheckURLModel();
});
