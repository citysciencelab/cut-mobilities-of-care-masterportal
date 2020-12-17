import getProxyUrl from "../../src/utils/getProxyUrl";

const ElasticModel = Backbone.Model.extend(/** @lends ElasticModel.prototype */{
    /**
     * @class ElasticModel
     * @description This model ist the central functionality to send and receive requests from elastic indices.
     * It is called by several other tools such as the gdi search or the elastic search.
     * @extends Backbone.Model
     * @memberOf Core
     * @constructs
     */
    defaults: {
        xhrRequests: {}
    },
    /**
     * Main function to start the search using the xhrConfig.
     * @param {Object} xhrConfig The configuration of the xhr request.
     * @param {String} xhrConfig.serviceId Id of the rest-service to be used. If serviceId is give, the url from the rest-service is taken.
     * @param {String} xhrConfig.url If no serviceId is given, alternatively an url can be passed.
     * @param {String} xhrConfig.type Type of request. "POST" or "GET".
     * @param {Object} xhrConfig.payload Payload used to "POST" to url or be appended to url if type is "GET".
     * @param {Boolean} xhrConfig.async Flag if request should be sent asynchronously.
     * @param {String} xhrConfig.responseEntryPath="" The path of the hits in the response JSON. The different levels of the response JSON are marked with "."
     * @returns {Object} - The result object of the request.
     */
    search: function (xhrConfig) {
        const serviceId = xhrConfig.hasOwnProperty("serviceId") ? xhrConfig.serviceId : undefined,
            /**
             * @deprecated in the next major-release!
             * useProxy
             */
            useProxy = xhrConfig.hasOwnProperty("useProxy") ? xhrConfig.useProxy : false,
            restService = Radio.request("RestReader", "getServiceById", serviceId);
        let xhrRequests = this.get("xhrRequests"),
            result = {
                status: "success",
                message: "",
                hits: []
            },
            url = restService ? restService.get("url") : xhrConfig.url;

        if (url) {
            xhrRequests = this.abortXhrRequestByServiceId(xhrRequests, serviceId);
            /**
             * @deprecated in the next major-release!
             * useProxy
             * getProxyUrl()
             */
            url = useProxy ? getProxyUrl(url) : url;
            result = this.xhrSend(serviceId, url, xhrConfig, result);
            xhrRequests = this.abortXhrRequestByServiceId(xhrRequests, serviceId);
            this.setXhrRequests(xhrRequests);
        }
        else {
            result.status = "error";
            result.message = "Cannot retrieve url by rest-service with id: " + serviceId + "! Please check the configuration for rest-services!";
            result.hits = [];
        }
        return result;
    },

    /**
     * Aborts the running request by given serviceId and deletes it from the object.
     * @param {Object} xhrRequests all xhr requests that are currently running.
     * @param {String} serviceId Id of rest-service.
     * @returns {Object} - All xhr requests that have not be cancelled.
     */
    abortXhrRequestByServiceId: function (xhrRequests, serviceId) {
        if (xhrRequests[serviceId]) {
            xhrRequests[serviceId].abort();
            delete xhrRequests[serviceId];
        }

        return xhrRequests;
    },

    /**
     * Sends the request
     * @param {String} serviceId Id of rest-service.
     * @param {String} url url to send request.
     * @param {Object} xhrConfig Config with all necccessary params for request.
     * @param {Object} result Result object.
     * @param {String} result.status Status of request "success" or "error".
     * @param {String} result.message Message of request.
     * @param {Object[]} result.hits Array of result hits.
     * @returns {Object} - Parsed result of request.
     */
    xhrSend: function (serviceId, url, xhrConfig, result) {
        const xhr = new XMLHttpRequest(),
            type = xhrConfig.type || "POST",
            payload = xhrConfig.payload,
            async = xhrConfig.async || false,
            responseEntryPath = xhrConfig.responseEntryPath || "",
            that = this,
            urlWithPayload = type === "GET" ? url + JSON.stringify(payload) : url;
        let resultWithHits = result;

        this.get("xhrRequests")[serviceId] = xhr;
        xhr.open(type, urlWithPayload, async);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.onload = function (event) {
            resultWithHits = that.parseResponse(event, responseEntryPath, resultWithHits);
        };
        xhr.onerror = function (event) {
            resultWithHits.status = "error";
            resultWithHits.message = "error occured in xhr Request!" + event;
            resultWithHits.hits = [];
        };
        if (type === "POST") {
            xhr.send(JSON.stringify(payload));
        }
        else {
            xhr.send();
        }
        return resultWithHits;
    },

    /**
     * Parses the response event.
     * @param {Event} event Event of xhrRequest.
     * @param {String} responseEntryPath The path of the hits in the response JSON. The different levels of the response JSON are marked with "."
     * @param {Object} result Result object.
     * @param {String} result.status Status of request "success" or "error".
     * @param {String} result.message Message of request.
     * @param {Object[]} result.hits Array of result hits.
     * @returns {Object} - Parsed result of request.
     */
    parseResponse: function (event, responseEntryPath, result) {
        const currentTarget = event.currentTarget,
            status = currentTarget.status,
            resultWithHits = result;
        let response,
            hits = [];

        if (status === 200) {
            response = JSON.parse(currentTarget.response);
            hits = this.findAttributeByPath(response, responseEntryPath);
            resultWithHits.hits = hits;
        }
        else {
            resultWithHits.status = "error";
            resultWithHits.message = "could not parse Response from elasticSearch, Status: " + status;
            resultWithHits.hits = [];
        }
        return resultWithHits;
    },

    /**
     * Returns the attribute value of the given object by path.
     * If path is an array, the function recursively iterates over the object for each part and pushes the value in an array.
     * Otherwise only the value of the given attribute path will be returned.
     * @param {Object} object Object to derive value from.
     * @param {String|String[]} path Path of the attribute. "." in the path indicates the next deeper level.
     * @returns {*} - Value that is at position of given path.
     */
    findAttributeByPath: function (object, path) {
        let attribute = object,
            paths;

        if (Array.isArray(path)) {
            attribute = [];
            path.forEach(pathPart => {
                attribute.push(this.findAttributeByPath(object, pathPart));
            });
        }
        else {
            paths = path.split(".");
            paths.forEach(pathPart => {
                attribute = attribute[pathPart];
            });
        }
        return attribute;
    },

    /**
     * Setter for attribute "xhrRequests"
     * @param {Object} value xhr requests.
     * @returns {void}
     */
    setXhrRequests: function (value) {
        this.set("xhrRequests", value);
    }
});

export default ElasticModel;
