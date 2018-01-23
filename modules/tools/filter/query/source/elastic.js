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
                url,
                mappingName;

            if (this.get("searchInMapExtent") === true) {
                this.addSearchInMapExtentSnippet();
            }
            if (!_.isUndefined(layerObject)) {
                mappingName = layerObject.get("mappingName");
                url = Radio.request("Util", "getProxyURL", layerObject.get("indexUrl")) + "_mapping/" + mappingName;
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
            var elements = response.itgbm_new.mappings.erhebung_2016_2017_fs.properties,
                featureAttributesMap = [];

            _.each(elements, function (value, key) {
                featureAttributesMap.push({name: key, type: value.type});
            });
            this.createSnippets(featureAttributesMap);
        }
    });

    return ElasticQueryModel;
});
