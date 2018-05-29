define([
    "backbone",
    "config",
    "backbone.radio"
], function (Backbone, Config, Radio) {

    var bacomParam = Backbone.Model.extend({
        defaults: {
            markerPosition: []
        },
        initialize: function () {

            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1).toUpperCase(), // URL --> alles nach ? wenn vorhanden
                result = {},
                channel = Radio.channel("CustomModule");

            channel.reply({
                "getMarkerPosition": function () {
                    return this.getMarkerPosition();
                }
            }, this);
            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });
            if (_.has(result, "LGV_BEZIRK")) {
                var bezirk = _.values(_.pick(result, "LGV_BEZIRK"))[0],
                    bezirke = [
                        {name: "ALTONA", number: "2", position: [556681, 5937664], extent: [548686.896000002, 5933123.931, 564481.728, 5942275.50099977]},
                        {name: "HAMBURG-HARBURG", number: "7", position: [560291, 5925817], extent: [551083.956999999, 5918852.823, 569653.991999999, 5932876.285]},
                        {name: "HAMBURG-Nord", number: "4", position: [567677, 5941650], extent: [563882.048, 5934839.559, 571112.960999999, 5948599.074]},
                        {name: "BERGEDORF", number: "6", position: [578779, 5924255], extent: [569943.097400005, 5917210.777, 586992.383000001, 5931374.09509976]},
                        {name: "EIMSBÜTTEL", number: "3", position: [561618, 5940019], extent: [557613.243999999, 5934918.565, 566358.535999998, 5945327.13]},
                        {name: "HAMBURG-Mitte", number: "1", position: [566380, 5932134], extent: [551111.0, 5923000.96, 577041.294, 5936000.0]},
                        {name: "WANDSBEK", number: "5", position: [574344, 5943750], extent: [567514.581, 5935168.932, 579149.706999999, 5953539.79]}
                    ];
                	if (bezirk.length === 1) {
                        // Für lokale Entwicklungsumgebung notwendig, da keine Events zu dem Zeitpunkt vorhanden sind
                        // Config.view.center = _.findWhere(bezirke, {number: bezirk}).position;
                        Radio.trigger("Map", "zoomToExtent", _.findWhere(bezirke, {number: bezirk}).extent);
                    }
                    else {
                        // Für lokale Entwicklungsumgebung notwendig, da keine Events zu dem Zeitpunkt vorhanden sind
                        // Config.view.center = _.findWhere(bezirke, {name: bezirk}).position;
                        Radio.trigger("Map", "zoomToExtent", _.findWhere(bezirke, {number: bezirk}).extent);
                    }
            }
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
                // Für lokale Entwicklungsumgebung notwendig, da keine Events zu dem Zeitpunkt vorhanden sind
                // Config.view.center= values;
                Radio.trigger("MapView", "setCenter", values, 8);
                this.setMarkerPosition(values);
                Radio.trigger("MapMarker", "showMarker", values);
            }
        },

        // getter for markerPosition
        getMarkerPosition: function () {
            return this.get("markerPosition");
        },
        // setter for markerPosition
        setMarkerPosition: function (value) {
            this.set("markerPosition", value);
        }
    });

    return bacomParam;
});
