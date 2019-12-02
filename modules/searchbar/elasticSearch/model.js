
import ElasticSearch from "../../core/elasticsearch";

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
        xhrRequest: {},
        async: false,
        elasticSearch: new ElasticSearch()
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
    initialize: function () {
        const initSearchString = Radio.request("ParametricURL", "getInitString");
        // let url = "";

        // url = this.retrieveUrlFromServiceId(this.get("serviceId"));
        // if (url !== "") {
        // this.setUrl(url);
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
        if (initSearchString) {
            this.search(initSearchString);
        }
        // }
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
        const searchStringAttribute = this.get("searchStringAttribute"),
            payload = this.appendSearchStringToPayload(this.get("payload"), searchStringAttribute, searchString),
            xhrConfig = {
                serviceId: this.get("serviceId"),
                type: this.get("type"),
                async: this.get("async"),
                payload: payload,
                responseEntryPath: this.get("responseEntryPath")
            };
        let result;

        if (searchString.length >= this.get("minChars")) {
            result = this.get("elasticSearch").search(xhrConfig);
            this.createRecommendedList(result.hits);
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
    }
});

export default ElasticSearchModel;
