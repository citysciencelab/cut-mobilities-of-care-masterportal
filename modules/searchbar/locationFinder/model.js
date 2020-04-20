import "../model";
import {transformToMapProjection, getProjection} from "masterportalAPI/src/crs";

const LocationFinderModel = Backbone.Model.extend(/** @lends LocationFinderModel.prototype */{
    defaults: {
        incrementalSearch: true,
        serviceUrl: undefined,
        classes: [],
        ajaxRequest: null,
        useProxy: false
    },

    /**
     * @class MapView
     * @description Initialize search via LocationFinder
     * @extends Backbone.Model
     * @memberOf Searchbar.LocationFinder
     * @constructs
     * @property {boolean} incrementalSearch=true - Enable/disable incremental search (autocomplete)
     * @property {string} serviceUrl - URL of LocationFinder-Service
     * @property {Object} classes=[] - Filter results of LocationFinder to listed classes.
     * @property {*} ajaxRequest=null - Object for controlling ajax request
     * @property {boolean} useProxy=false - Use proxy
     * @param {Object} config - The configuration object of the LocationFinder search
     * @param {number} [config.incrementalSearch=true] - Enable/disable incremental search (autocomplete)
     * @param {number} config.serviceId - ID of rest service
     * @param {number} [config.classes] - Filter results of LocationFinder to listed classes.
     * @param {number} [config.useProxy=false] - Use proxy
     * @listens Searchbar#RadioTriggerSearchbarSearchAll
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    initialize: function (config) {

        const service = Radio.request("RestReader", "getServiceById", config.serviceId);

        if (typeof service === "object" && typeof service.get("url") === "string") {

            const activators = {
                "searchAll": this.search
            };

            if (this.get("useProxy")) {
                this.setServiceUrl(Radio.request("Util", "getProxyURL", service.get("url")));
            }
            else {
                this.setServiceUrl(service.get("url"));
            }

            if (Radio.request("ParametricURL", "getInitString")) {
                this.search(Radio.request("ParametricURL", "getInitString"));
            }

            if (this.get("incrementalSearch")) {
                activators.search = this.search;
            }
            this.listenTo(Radio.channel("Searchbar"), activators);

        }
        else {
            this.showError({
                msg: i18next.t("common:modules.searchbar.locationFinder.invalidServicID")
            });
        }
    },

    /**
     * Clear hit list from previous search and prepare new search.
     * @param {string} searchString - Pattern
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @returns {void}
     */
    search: function (searchString) {

        Radio.trigger("Searchbar", "removeHits", "hitList", {type: "locationFinder"});

        const url = this.get("serviceUrl") + "/Lookup",
            payload = {
                query: searchString
            };

        // Filter results by classes
        if (Array.isArray(this.get("classes")) && this.get("classes").length > 0) {
            payload.filter = "type:" + this.get("classes").join(",");
        }

        // Set target CRS
        if (this.get("spatialReference")) {
            payload.sref = this.get("spatialReference");
        }
        else {
            payload.sref = Radio.request("MapView", "getProjection").getCode();
        }

        this.sendRequest(url, payload);
    },

    /**
     * Evaluate hits of the search; create offer list.
     * @param  {Array} data - Response of service
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @returns {void}
     */
    pushSuggestions: function (data) {

        const crs = "EPSG:" + data.sref;

        // Test for sucess-status of service
        if (!(data.hasOwnProperty("ok") && data.ok)) {
            let statusText = i18next.t("common:modules.searchbar.locationFinder.serverError");

            if (data.info) {
                statusText = statusText + ": " + data.info;
            }
            this.showError({
                statusText: statusText
            });
            Radio.trigger("Searchbar", "abortSearch", "locationFinder");
            return;
        }

        // Test for valid/usable crs
        if (!getProjection(crs)) {
            this.showError({
                statusText: i18next.t("common:modules.searchbar.locationFinder.unknownProjection") + " (" + crs + ")"
            });
            Radio.trigger("Searchbar", "abortSearch", "locationFinder");
            return;
        }

        if (Array.isArray(data.locs)) {
            data.locs.forEach(locationFinderResult => {

                Radio.trigger("Searchbar", "pushHits", "hitList", {
                    name: locationFinderResult.name,
                    id: "locationFinder_" + locationFinderResult.id,
                    coordinate: transformToMapProjection(Radio.request("Map", "getMap"), crs, [parseFloat(locationFinderResult.cx), parseFloat(locationFinderResult.cy)]),
                    glyphicon: "glyphicon-road",
                    locationFinder: true,
                    type: locationFinderResult.type
                });
            });
        }

        Radio.trigger("Searchbar", "createRecommendedList", "locationFinder");
    },

    /**
     * Start request after aborting pending request (if neccessary).
     * @param {String} url - URL the request is sent to.
     * @param {String} data - Data to be sent to the server
     * @returns {void}
     */
    sendRequest: function (url, data) {
        var ajax = this.get("ajaxRequest");

        if (ajax) {
            ajax.abort();
            this.polishAjax();
        }
        this.ajaxSend(url, data);
    },

    /**
     * Fires an HTTP GET request and saves its id.
     * @param  {String} url - url of service
     * @param  {JSON} data - payload
     * @fires Searchbar#RadioTriggerAbortSearch
     * @return {void}
     */
    ajaxSend: function (url, data) {
        this.setAjaxRequest($.ajax({
            url: url,
            data: data,
            dataType: "json",
            context: this,
            type: "GET",
            success: this.pushSuggestions,
            timeout: 6000,
            error: function (err) {
                if (err.status !== 0) { // No alert for aborted requests
                    if (err.status === 404) {
                        err.statusText = i18next.t("common:modules.searchbar.locationFinder.notFound");
                    }
                    this.showError(err);
                }
                Radio.trigger("Searchbar", "abortSearch", "locationFinder");
            },
            complete: function () {
                this.polishAjax();
            }
        }));
    },

    /**
     * Triggers the display of an error message.
     * @param {object} err - Error object from Ajax request.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    showError: function (err) {

        let msg = err.msg && err.msg !== "" ? err.msg : i18next.t("common:modules.searchbar.locationFinder.errorMsg");

        if (err.statusText && err.statusText !== "") {
            msg += ": " + err.statusText;
        }

        Radio.trigger("Alert", "alert", msg);
    },

    /**
     * Clean ajax request
     * @returns {void}
     */
    polishAjax: function () {
        this.setAjaxRequest(null);
    },

    /**
     * Setter for serviceUrl
     * @param {String} value - url of LocationFinder-service
     * @returns {void}
     */
    setServiceUrl: function (value) {
        this.set("serviceUrl", value);
    },

    /**
     * Setter for ajaxRequest.
     * @param {Object} value - ajax request object
     * @returns {void}
     */
    setAjaxRequest: function (value) {
        this.set("ajaxRequest", value);
    }
});

export default LocationFinderModel;
