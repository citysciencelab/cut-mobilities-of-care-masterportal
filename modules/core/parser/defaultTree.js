define([
    "backbone.radio",
    "modules/core/parser/portalConfig"
], function () {

     var Parser = require("modules/core/parser/portalConfig"),
        Radio = require("backbone.radio"),
        DefaultTreeParser;

    DefaultTreeParser = Parser.extend({
        initialize: function () {
            var layerList = Radio.request("RawLayerList", "getLayerAttributesList");

            this.parseTree(layerList);
        },

        /**
         *
         */
        parseTree: function (layerList) {
            // Im Default-Tree(FHH-Atlas / GeoOnline) werden nur WMS angezeigt
            // Und nur Layer die einem Metadatensatz zugeordnet sind
            layerList = this.filterList(layerList);
        },

        /**
         * Filtert alle Objekte aus der layerList, die kein WMS sind und min. einem Datensatz zugordnet sind
         * @param  {Object[]} layerList - Objekte aus der services.json
         * @return {Object[]} layerList - Objekte aus der services.json
         */
        filterList: function (response) {
            return _.filter(response, function (element) {
                return (element.datasets.length > 0 && element.typ === "WMS") ;
            });
        }
    });

    return DefaultTreeParser;
});
