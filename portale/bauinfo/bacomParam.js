define([
    "backbone",
    "eventbus",
    "config"
], function (Backbone, EventBus, Config) {

    var bacomParam = Backbone.Model.extend({
        /*
         * Lese Layer mit URL und starte refreshVerkehrsmeldungen, wobei layerid der gleichen URL entsprechen muss.
         */
        initialize: function () {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1).toUpperCase(), // URL --> alles nach ? wenn vorhanden
                result = {};

            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });
            /**
             * Gibt die initiale Zentrumskoordinate zurück.
             * Ist der Parameter "center" vorhanden wird dessen Wert zurückgegeben, ansonsten der Standardwert.
             */
            if (_.has(result, "LGV_CENTER")) {
                var values = _.values(_.pick(result, "LGV_CENTER"))[0].split(",");

                _.each(values, function (value, index) {
                    value = parseInt(value, 10);
                    values[index] = value;
                });
                Config.view.center = values;
            }

            if (_.has(result, "LGV_BEZIRK")) {
                var bezirk = _.values(_.pick(result, "LGV_BEZIRK"))[0],
                    bezirke = [
                        {name: "ALTONA", number: "2", position: [556681, 5937664]},
                        {name: "HAMBURG-HARBURG", number: "7", position: [560291, 5925817]},
                        {name: "HAMBURG-Nord", number: "4", position: [567677, 5941650]},
                        {name: "BERGEDORF", number: "6", position: [578779, 5924255]},
                        {name: "EIMSBÜTTEL", number: "3", position: [561618, 5940019]},
                        {name: "HAMBURG-Mitte", number: "1", position: [566380, 5932134]},
                        {name: "WANDSBEK", number: "5", position: [574344, 5943750]}
                    ];

                    if (bezirk.length === 1) {
                        Config.view.center = _.findWhere(bezirke, {number: bezirk}).position;
                    }
                    else {
                        Config.view.center = _.findWhere(bezirke, {name: bezirk}).position;
                    }
            }

        }
    });

    return bacomParam;
});
