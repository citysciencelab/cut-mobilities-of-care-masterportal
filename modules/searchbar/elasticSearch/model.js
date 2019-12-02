const ElasticSearchModel = Backbone.Model.extend(/** @lends ElasticSearchModel.prototype */{
    defaults: {
        minChars: 3,
        serviceId: "11",
        url: "",
        payload: {},
        searchStringAttribute: "searchString",
        type: "POST",
        responseEntryPath: "",
        triggerEvent: {},
        hitMap: {
            name: "name",
            id: "id",
            coordinate: "coordinate"
        },
        hitType: "Elastic",
        hitGlyphicon: "glyphicon-road",
        xhrRequest: {}
    },
    /**
     * @class ElasticSearchModel
     * @extends Backbone.Model
     * @memberof Searchbar.ElasticSearch
     * @constructs
     * @property {Number} minChars=3 Minimum length of search string to start.
     * @property {String} serviceId="11" Id of restService to derive url from.
     * @property {String} url="" Url derived from restService.
     * @property {Object} payload={} Payload used to POST to url.
     * @property {String} searchStringAttribute="searchString" The Search string is added to the payload object with this key.
     * @param {Object} config Config from config.json
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @listens Searchbar#RadioTriggerSearchbarSearch
     */
    initialize: function (config) {
        const initSearchString = Radio.request("ParametricURL", "getInitString");
        let url = "";

        this.parseConfig(config);
        url = this.retrieveUrlFromServiceId(this.get("serviceId"));
        if (url !== "") {
            this.setUrl(url);
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });
            if (initSearchString) {
                this.search(initSearchString);
            }
        }
    },
    /**
     * Reads the Configuration from config.json and sets all given params.
     * @param {Object} config Configuration from config.json.
     * @returns {void}
     */
    parseConfig: function (config) {
        Object.keys(config).forEach(key => {
            this.set(key, config[key]);
        });
    },

    /**
     * Retrieves url from rest service using the attribute "serviceId".
     * @param {String} serviceId Id of rest service.
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @returns {String} - url of rest service.
     */
    retrieveUrlFromServiceId: function (serviceId) {
        const service = Radio.request("RestReader", "getServiceById", serviceId);
        let url = "";

        if (service) {
            url = service.get("url");
        }
        else {
            console.error("Could not retrieve url from rest service. Elastic search will fail!");
        }
        return url;
    },

    /**
     * Checks if the minChars criterium is passed, then sends the request to the elastic search index.
     * @param {String} searchString The search string.
     * @returns {void}
     */
    search: function (searchString) {
        let payload = this.get("payload");
        const xhrRequest = this.get("xhrRequest");

        if (xhrRequest instanceof XMLHttpRequest) {
            xhrRequest.abort();
            this.setXhrRequest({});
        }
        if (searchString.length >= this.get("minChars")) {
            payload = this.appendSearchStringToPayload(payload, this.get("searchStringAttribute"), searchString);
            this.sendRequest(payload);
        }
    },

    /**
     * Recursively searches for the searchStringAttribute key and sets the searchString.
     * Adds the search string to the payload using the given key
     * @param {Object} payload Payload as Object
     * @param {String} searchStringAttribute Attribute key to be added to the payload object.
     * @param {String} searchString Search string to be added using the searchStringAttribute.
     * @returns {Object} - the payload with the search string.
     */
    appendSearchStringToPayload: function (payload, searchStringAttribute, searchString) {
        Object.keys(payload).forEach(key => {
            if (typeof payload[key] === "object") {
                payload[key] = this.appendSearchStringToPayload(payload[key], searchStringAttribute, searchString);
            }
            if (key === searchStringAttribute) {
                payload[searchStringAttribute] = searchString;
            }
        });

        return payload;
    },

    /**
     * Posts the request to the url with the given payload.
     * @param {Object} payload Payload object to be sent via POST to the url.
     * @fires Core#RadioRequestUtilGetProxyURL
     * @returns {void}
     */
    sendRequest: function (payload) {
        const url = Radio.request("Util", "getProxyURL", this.get("url")),
            type = this.get("type");
        let xhr = {};

        if (type === "POST") {
            xhr = this.sendPostRequest(url, payload);
        }
        else if (type === "GET") {
            xhr = this.sendGetRequest(url, payload);
        }
        else {
            console.error("type: " + type + " not supported in elasticSearch");
        }
        this.setXhrRequest(xhr);
    },

    /**
     * Sends POST request.
     * @param {String} url Url to post request.
     * @param {Object} payload The data to be sent.
     * @returns {XMLHttpRequest} - XHR.
     */
    sendPostRequest: function (url, payload) {
        const xhr = new XMLHttpRequest(),
            that = this;

        xhr.open("POST", url);
        xhr.onload = function (event) {
            that.parseResponse(event);
        };
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(payload));
        return xhr;
    },

    /**
     * Sends GET request.
     * @param {String} url Url to get request.
     * @param {Object} payload The data to be sent.
     * @returns {XMLHttpRequest} - XHR.
     */
    sendGetRequest: function (url, payload) {
        const xhr = new XMLHttpRequest(),
            that = this,
            urlWithPayload = url + JSON.stringify(payload);

        xhr.open("GET", urlWithPayload);
        xhr.onload = function (event) {
            that.parseResponse(event);
        };
        xhr.send();
        return xhr;
    },
    /**
     * Parses the response of the request
     * @param {Event} event Response event.
     * @returns {void}
     */
    parseResponse: function (event) {
        const currentTarget = event.currentTarget,
            status = currentTarget.status,
            responseEntryPath = this.get("responseEntryPath");
        let responseData = [],
            response;

        if (status === 200) {
            response = JSON.parse(currentTarget.response);
            responseData = this.findAttributeByPath(response, responseEntryPath);
            this.createRecommendedList(responseData);
        }
        else {
            console.error("could not parse Response from elasticSearch, Status: " + status);
        }
        this.setXhrRequest({});
    },

    /**
     * Creates the reccommended List
     * @param {Object[]} responseData Response data.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    createRecommendedList: function (responseData) {
        const triggerEvent = this.get("triggerEvent"),
            hitMap = this.get("hitMap"),
            hitType = this.get("hitType"),
            hitGlyphicon = this.get("hitGlyphicon");

        if (responseData.length > 0) {
            responseData.forEach(result => {
                const hit = this.createHit(result, hitMap, hitType, hitGlyphicon, triggerEvent);

                Radio.trigger("Searchbar", "pushHits", "hitList", hit);
            });
        }
        else {
            Radio.trigger("Searchbar", "removeHits", "hitList", {type: "Straße"});
        }
        Radio.trigger("Searchbar", "createRecommendedList", "elasticSearch");
    },

    /**
     * Creates hit that is sent to the hitList.
     * @param {Object} result Result object from elastcisearch request.
     * @param {Object} hitMap Mapping object. Used to map results attributes to neccessary hit attributes.
     * @param {String} hitType Type of hit.
     * @param {String} hitGlyphicon Glyphicon class to show in reccomendedList
     * @param {Object} triggerEvent Object defining channel and event. used to fire event on mouseover and click in recommendedList.
     * @returns {Object} - hit.
     */
    createHit: function (result, hitMap, hitType, hitGlyphicon, triggerEvent) {
        let hit = {};

        Object.keys(hitMap).forEach(key => {
            hit[key] = this.findAttributeByPath(result, hitMap[key]);
        });
        hit.type = hitType;
        hit.glyphicon = hitGlyphicon;
        if (Object.keys(triggerEvent).length > 0) {
            hit = Object.assign(hit, {triggerEvent: triggerEvent});
        }
        return hit;
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
     * Setter for attribute "url".
     * @param {String} value url.
     * @returns {void}
     */
    setUrl: function (value) {
        this.set("url", value);
    },
    /**
     * Setter for attribute "xhrRequest".
     * @param {XMLHttpRequest} value XHR.
     * @returns {void}
     */
    setXhrRequest: function (value) {
        this.set("xhrRequest", value);
    }
});

export default ElasticSearchModel;
