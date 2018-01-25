define(function (require) {

    var WfsQueryModel = require("modules/tools/filter/query/source/wfs"),
        ElasticQueryModel;

    ElasticQueryModel = WfsQueryModel.extend({
        /**
         * Sends a Mapping Request for the Layer asscociated with this Query
         * and proceeds to build the datastructure including the snippets for this query
         * @param  {string} url - WFS Url
         * @param  {string} featureType - WFS FeatureType
         * @param  {string} version - WFS Version
         */
        buildQueryDatastructure: function () {
            var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")}),
                url;

            if (this.get("searchInMapExtent") === true) {
                this.addSearchInMapExtentSnippet();
            }
            if (!_.isUndefined(layerObject)) {
                url = Radio.request("Util", "getProxyURL", layerObject.get("url")) + "_mapping/" + layerObject.get("typeName");
                this.requestMetadata(url, this.parseResponse);
            }
        },
        /**
         * Führt Mapping Request aus
         * @param  {[type]} url         [description]
         * @param  {[type]} callback [description]
         */
        requestMetadata: function (url, callback) {
            $.ajax({
                url: url,
                context: this,
                success: callback
            });
        },

        /**
         * Extract Attribute names and types from Mapping-Response
         * @param  {JSON} response
         */
        parseResponse: function (response) {
            var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")}),
                typeName = layerObject.get("typeName");
                elements = response.itgbm_new.mappings[typeName].properties,
                featureAttributesMap = [];

            _.each(elements, function (value, key) {
                featureAttributesMap.push({name: key, type: value.type});
            });
            this.createSnippets(featureAttributesMap);
        }
    });

    return ElasticQueryModel;
});
