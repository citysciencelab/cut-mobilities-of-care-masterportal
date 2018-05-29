define(function (require) {

    var Backbone = require("backbone"),
        CheckURLModel;

    CheckURLModel = Backbone.Model.extend({
        initialize: function () {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1).toUpperCase(), // URL --> alles nach ? wenn vorhanden
                result = {};

            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });

            /**
             * Hier wird geprüft, ob eine Berechnung bereits erfolgt ist bzw. Ob bezahlt werden muss.
             */
            if (_.has(result, "STATUS") === true && _.has(result, "ORDERID") === true) {
                if (result.STATUS === "SUCCESS") {
                    require(["idaModules/returnPages/success/view"], function (DownloadView) {
                        new DownloadView (_.values(_.pick(result, "ORDERID"))[0]);
                    });
                }
                else if (result.STATUS === "CANCEL") {
                    require(["idaModules/returnPages/cancel/view"], function (CancelView) {
                        new CancelView (_.values(_.pick(result, "ORDERID"))[0]);
                    });
                }
                else if (result.STATUS === "FAILURE") {
                    require(["idaModules/returnPages/failure/view"], function (FailureView) {
                        new FailureView (_.values(_.pick(result, "ORDERID"))[0]);
                    });
                }
                else {
                    require(["idaModules/returnPages/fatal/view"], function (FailureView) {
                        new FailureView (_.values(_.pick(result, "ORDERID"))[0]);
                    });
                }
            }
            else {
                require(["idaModules/1_queries/view"], function (QueryView) {
                    new QueryView();
                });
            }
        }
    });

    return new CheckURLModel();
});
