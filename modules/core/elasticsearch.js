const ElasticSearchModel = Backbone.Model.extend(/** @lends ElasticSearchModel.prototype */{
    defaults: {
        xhrRequests: {}
    },
    search: function (xhrConfig) {
        const serviceId = xhrConfig.hasOwnProperty("serviceId") ? xhrConfig.serviceId : undefined,
            restService = Radio.request("RestReader", "getServiceById", serviceId);
        let xhrRequests = this.get("xhrRequests"),
            result = {
                status: "success",
                message: "",
                hits: []
            },
            url = restService ? restService.get("url") : undefined;

        if (url) {
            xhrRequests = this.abortXhrRequestByServiceId(xhrRequests, serviceId);
            url = Radio.request("Util", "getProxyURL", url);
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

    abortXhrRequestByServiceId: function (xhrRequests, serviceId) {
        if (xhrRequests[serviceId]) {
            xhrRequests[serviceId].abort();
            delete xhrRequests[serviceId];
        }

        return xhrRequests;
    },
    xhrSend: function (serviceId, url, xhrConfig, result) {
        const xhr = new XMLHttpRequest(),
            type = xhrConfig.type || "POST",
            payload = xhrConfig.payload || undefined,
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

    setXhrRequests: function (value) {
        this.set("xhrRequests", value);
    }
});

export default ElasticSearchModel;
