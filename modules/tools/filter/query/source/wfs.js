import SourceModel from "./model";

const WfsQueryModel = SourceModel.extend({
    initialize: function () {
        this.initializeFunction();
    },

    /**
     * Sends a DescriptFeatureType Request for the Layer asscociated with this Query
     * and proceeds to build the datastructure including the snippets for this query
     * @param  {string} layerObject - WFS Url
     * @param  {string} url - WFS Url
     * @param  {string} featureType - WFS FeatureType
     * @param  {string} version - WFS Version
     * @returns {void}
     */
    buildQueryDatastructureByType: function (layerObject) {
        var url = Radio.request("Util", "getProxyURL", layerObject.get("url")),
            featureType = layerObject.get("featureType"),
            version = layerObject.get("version"),
            featureAttributesMap = [];

        featureAttributesMap = this.requestMetadata(url, featureType, version, this.parseResponse);

        return featureAttributesMap;
    },
    /**
     * Führt DescriptFeatureType Request aus
     * @param  {string} url         url to wfs
     * @param  {string} featureType featuretype of wfs
     * @param  {string} version     version of wfs
     * @param  {function} callback  callbackfunction for ajaxrequest
     * @return {void}
     */
    requestMetadata: function (url, featureType, version, callback) {
        $.ajax({
            url: url,
            context: this,
            data: "service=WFS&version=" + version + "&request=DescribeFeatureType&typename=" + featureType,
            // parent (QueryModel) function
            success: callback
        });
    },
    /**
     * Extract Attribute names and types from DescribeFeatureType-Response
     * @param  {XML} response response xml from ajax call
     * @return {object} - Mapobject containing names and types
     */
    parseResponse: function (response) {
        var elements = $("element", response),
            featureAttributesMap = [];

        _.each(elements, function (element) {
            featureAttributesMap.push({name: $(element).attr("name"), type: $(element).attr("type")});
        });

        this.createSnippets(featureAttributesMap);
    }
});

export default WfsQueryModel;
