import SourceModel from "./model";

const WfsQueryModel = SourceModel.extend(/** @lends WfsQueryModel.prototype*/{

    /**
     * @class WfsQueryModel
     * @extends SourceModel
     * @memberof Tools.Filter.Query.Source
     * @constructs
     * @fires Util#getProxyURL
     */
    initialize: function () {
        this.initializeFunction();
    },

    /**
     * Sends a DescriptFeatureType Request for the Layer asscociated with this Query
     * and proceeds to build the datastructure including the snippets for this query
     * @param  {string} layerObject - WFS LayerObject
     * @param  {string} url - WFS Url
     * @param  {string} featureType - WFS FeatureType
     * @param  {string} version - WFS Version
     * @returns {void}
     */
    buildQueryDatastructureByType: function (layerObject) {
        var url = Radio.request("Util", "getProxyURL", layerObject.url),
            featureType = layerObject.featureType,
            version = layerObject.version,
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
     * Extract Attribute names and types from DescribeFeatureType-Response and creates the snippets
     * @param  {object} response response xml from ajax call. Depending on the wfs this is a xml-string or a xml-object.
     * @return {object} - Mapobject containing names and types
     */
    parseResponse: function (response) {
        var selector = "element",
            responseString,
            searchForNamespaceResult,
            elements,
            featureAttributesMap = [];

        // Serialize xml-object. Skipped if a xml-string was provided.
        if (!_.isString(response)) {
            responseString = new XMLSerializer().serializeToString(response);
        }
        else {
            responseString = response;
        }

        // Detect namespaces. If a namespace was found the selector has to be adapted to get a result later on.
        searchForNamespaceResult = (/<([^<]+):element/i).exec(responseString);
        if (searchForNamespaceResult && searchForNamespaceResult.length === 2) {
            selector = searchForNamespaceResult[1] + "\\:element";
        }

        elements = $(selector, response);

        _.each(elements, function (element) {

            var type = $(element).attr("type"),
                typeWithoutNamespace,
                simpleTypeIndex,
                restriction;

            if (!type) {
                // Fallback: Try to get type from simpleType-Node (if provided). If this fails the element is rejected.
                simpleTypeIndex = Array.from(element.childNodes).findIndex(nodeItem => (/simpletype/i).exec(nodeItem.tagName));
                if (simpleTypeIndex !== -1) {
                    restriction = Array.from(element.childNodes[simpleTypeIndex].childNodes).find(nodeItem => (/restriction/i).exec(nodeItem.tagName));
                    if (restriction) {
                        type = restriction.getAttribute("base");
                    }
                    else {
                        return;
                    }
                }
                else {
                    return;
                }
            }

            // Remove namespace (if neccesary)
            typeWithoutNamespace = type.replace(/.*?:?([^:]*)$/i, "$1");

            // Summerize numerical types
            if (typeWithoutNamespace === "long" || typeWithoutNamespace === "double" || typeWithoutNamespace === "short") {
                typeWithoutNamespace = "decimal";
            }

            featureAttributesMap.push({name: $(element).attr("name"), type: typeWithoutNamespace});
        });

        this.createSnippets(featureAttributesMap);
    }
});

export default WfsQueryModel;
