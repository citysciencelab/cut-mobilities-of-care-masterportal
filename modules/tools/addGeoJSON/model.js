define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        AddGeoJSON;

    AddGeoJSON = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("AddGeoJSON");

            this.listenTo(channel, {
                "addGeoJsonToMap": this.addGeoJsonToMap
            });
        },

        /**
         * Erzeugt aus den Attributen im "IT-GBM" Index OpenLayers Features
         * @param  {Object[]} hits - Trefferliste mit Attributen
         */
        addGeoJsonToMap: function (layerName, layerId, geojson) {
            Radio.trigger("Parser", "addGeoJSONLayer", layerName, layerId, geojson);
            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        }
    });

    return AddGeoJSON;

});
