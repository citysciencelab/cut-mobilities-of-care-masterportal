import QueryModel from "../model";
import {intersects} from "ol/extent.js";

const WfsQueryModel = QueryModel.extend({
    initialize: function () {
        this.initializeFunction();
    },
    /**
     * delivers the layerSource from an layer,
     * by grouplayer delivers the layerSource from child by layerid
     * @param {object} layerSource from layer
     * @param {number} layerId id from layer
     * @returns {object} layerSource
     */
    retrieveLayerSource: function (layerSource, layerId) {
        var layer,
            groupLayerSource = layerSource;

        if (_.isArray(layerSource)) {
            layer = _.find(layerSource, function (child) {
                return child.get("id") === layerId;
            });
            groupLayerSource = layer.get("layerSource");
        }

        return groupLayerSource;
    },

    /**
     * Sends a DescriptFeatureType Request for the Layer asscociated with this Query
     * and proceeds to build the datastructure including the snippets for this query
     * @param  {string} url - WFS Url
     * @param  {string} featureType - WFS FeatureType
     * @param  {string} version - WFS Version
     * @returns {void}
     */
    // buildQueryDatastructure: function () {
    //     var layerObject = Radio.request("RawLayerList", "getLayerWhere", {id: this.get("layerId")}),
    //         url,
    //         featureType,
    //         version;

    //     if (this.get("searchInMapExtent") === true) {
    //         this.addSearchInMapExtentSnippet();
    //     }
    //     if (!_.isUndefined(layerObject)) {
    //         url = Radio.request("Util", "getProxyURL", layerObject.get("url"));
    //         featureType = layerObject.get("featureType");
    //         version = layerObject.get("version");
    //         this.requestMetadata(url, featureType, version, this.parseResponse);
    //     }
    // },
    buildQueryDatastructureByType: function (layerObject) {
        var url = Radio.request("Util", "getProxyURL", layerObject.get("url")),
            featureType = layerObject.get("featureType"),
            version = layerObject.get("version");

        this.requestMetadata(url, featureType, version, this.parseResponse);
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
        return featureAttributesMap;
    }
});

export default WfsQueryModel;
