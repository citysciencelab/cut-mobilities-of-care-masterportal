import {WFS} from "ol/format.js";
import getProxyUrl from "../../src/utils/getProxyUrl";

const WFSTransaction = Backbone.Model.extend({
    defaults: {
        useProxy: false
    },
    initialize: function () {
        const channel = Radio.channel("wfsTransaction");

        channel.on({
            "transact": this.transact
        }, this);
    },

    /**
     * executes the wfs transaction
     * @param  {String} layerId -
     * @param  {String} featureId -
     * @param  {String} mode - transaction mode insert|update|delete
     * @param  {Object} attributes - feature attributes to be changed
     * @returns {void}
     */
    transact: function (layerId, featureId, mode, attributes) {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

        let feature,
            xmlString,
            dom;

        if (model !== undefined) {
            feature = model.get("layer").getSource().getFeatureById(featureId);
            feature.setProperties(attributes);
            feature.unset("extent");
            dom = this.writeTransaction(mode, [feature], this.getWriteOptions(model));
            xmlString = new XMLSerializer().serializeToString(dom);
            if (xmlString.search("xmlns:app=") === -1) {
                xmlString = xmlString.replace("<Update typeName='app:" + model.get("featureType") + "'>", "<Update xmlns:app='" + model.get("featureNS") + "' typeName='app:" + model.get("featureType") + "'>");
            }
            xmlString = xmlString.replace(/<Name>/g, "<Name>app:");
            this.sendRequest(model.get("url"), xmlString);
        }
    },

    /**
     * writes a WFS Transaction and return the DOM.
     * @param  {String} mode - transaction mode insert|update|delete
     * @param  {ol.Feature[]} features - features to insert, udpate or delete
     * @param  {Object} writeOptions -
     * @return {DOM} node
     */
    writeTransaction: function (mode, features, writeOptions) {
        const formatWFS = new WFS();
        let dom;

        switch (mode) {
            case "insert": {
                dom = formatWFS.writeTransaction(features, null, null, writeOptions);
                break;
            }
            case "delete": {
                dom = formatWFS.writeTransaction(null, null, features, writeOptions);
                break;
            }
            case "update": {
                dom = formatWFS.writeTransaction(null, features, null, writeOptions);
                break;
            }
            default: {
                break;
            }
        }
        return dom;
    },

    /**
     * gets the write options for wfs transaction
     * @param  {Backbone.Model} model -
     * @return {Object} write options
     */
    getWriteOptions: function (model) {
        return {
            featureNS: model.get("featureNS"),
            featureType: model.get("featureType"),
            featurePrefix: "app",
            srsName: "EPSG:25832"
        };
    },

    /**
     * sends a async POST request
     * @param  {String} url -
     * @param  {String} data -
     * @returns {void}
     */
    sendRequest: function (url, data) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const requestUrl = this.get("useProxy") ? getProxyUrl(url) : url;

        $.ajax(requestUrl, {
            type: "POST",
            dataType: "text", // receive type
            contentType: "text", // send type
            data: data,
            context: this,
            success: function (xmlString) {
                if (xmlString.indexOf("Exception") === -1) {
                    this.triggerRemoteInterface(true, xmlString);
                    Radio.trigger("Map", "render");
                }
                // successful ajax but wfst service answers with exception
                else {
                    this.triggerRemoteInterface(false, xmlString);
                }
            },
            error: function (xmlString) {
                this.triggerRemoteInterface(false, xmlString);
            }
        });
    },
    triggerRemoteInterface: function (success, msg) {
        Radio.trigger("RemoteInterface", "postMessage", {
            "transactFeatureById": "function identifier",
            "success": success,
            "response": msg
        });
    }
});

export default WFSTransaction;
