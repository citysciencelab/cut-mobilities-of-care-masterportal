import "../model";
import {transformToMapProjection} from "masterportalAPI/src/crs";

const OsmModel = Backbone.Model.extend(/** @lends OsmModel.prototype */{
    defaults: {
        minChars: 3,
        osmServiceUrl: "",
        limit: 50,
        street: "",
        states: "",
        searchParams: [],
        classes: [],
        ajaxRequest: null
    },

    /**
     * @class MapView
     * @description Initialisierung der OSM Suche
     * @extends Backbone.Model
     * @memberOf Searchbar.Osm
     * @constructs
     * @property {number} minChars=3 - todo
     * @property {string} osmServiceUrl="" - todo
     * @property {number} limit=50 - todo
     * @property {string} street="" - todo
     * @property {string} states="" - todo
     * @property {Array} searchParams=[] - todo
     * @property {Array} classes=[] - todo
     * @property {*} ajaxRequest=null - todo
     * @param {Object} config - The configuration object of the OSM search.
     * @param {number} [config.minChars=3] - Minimum number of characters before a search is initiated.
     * @param {string} config.osmServiceUrl - ID from rest services for URL.
     * @param {number} [config.limit=50] - Number of proposals requested.
     * @param {string}  [osm.states=""] - List of the federal states for the hit selection..
     * @listens Searchbar#RadioTriggerSearchbarSearchAll
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    initialize: function (config) {
        var service = Radio.request("RestReader", "getServiceById", config.serviceId);

        if (!_.isUndefined(config.minChars)) {
            this.setMinChars(config.minChars);
        }
        if (!_.isUndefined(service) && !_.isUndefined(service.get("url"))) {
            this.setOsmServiceUrl(service.get("url"));
        }
        if (!_.isUndefined(config.limit)) {
            this.setLimit(config.limit);
        }
        // über den Parameter "states" kann in der configdatei die Suche auf ander Bundesländer erweitert werden
        // Der Eintrag in "states" muss ein string mit den gewünschten Ländern von "address.state" der Treffer sein...
        if (!_.isUndefined(config.states)) {
            this.setStates(config.states);
        }

        if (!_.isUndefined(config.classes)) {
            this.setClasses(config.classes);
        }

        if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
            this.search(Radio.request("ParametricURL", "getInitString"));
        }
        this.listenTo(Radio.channel("Searchbar"), {
            // "search": this.search
            "searchAll": this.search
        });
    },

    /**
     * Access for the search...
     * Is triggered by the search bar.
     * @param {string} searchString - todo
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @returns {void}
     */
    search: function (searchString) {

        if (searchString.length >= this.get("minChars")) {
            Radio.trigger("Searchbar", "removeHits", "hitList", {type: "OpenStreetMap"});
            this.suggestByOSM(searchString);
        }
        else {
            Radio.trigger("Searchbar", "abortSearch", "osm");
        }
    },

    /**
     * Search string (street HsNr) constructed by user...
     * @param {string} searchString - todo
     * @returns {void}
     */
    suggestByOSM: function (searchString) {
        var request,
            searchStrings = [],
            tmp = searchString.split(",");

        _.each(tmp, function (elem) {
            if (elem.indexOf(" ") > -1) {
                _.each(elem.split(" "), function (elem2) {
                    if (elem2.trim().length > 0) {
                        this.push(elem2);
                    }
                }, this);
            }
            else {
                this.push(elem);
            }
        }, searchStrings);

        this.setSearchParams(searchStrings);

        request = "countrycodes=de&format=json&polygon=0&addressdetails=1&extratags=1&limit=" + this.get("limit");
        request = request + "&q=" + encodeURIComponent(searchString);

        this.sendRequest(this.get("osmServiceUrl"), request, this.pushSuggestions);
    },

    /**
     * Evaluate hits of the first search; create offer list.
     * @param  {Array} data - todo
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    pushSuggestions: function (data) {
        var display,
            metaName,
            bbox,
            north,
            east,
            upper,
            lower,
            center,
            weg,
            county;

        _.each(data, function (hit) {
            if (this.get("states").length === 0 || this.get("states").includes(hit.address.state)) {
                if (this.isSearched(hit, this.get("searchParams"))) {
                    weg = hit.address.road || hit.address.pedestrian;
                    county = hit.address.county;
                    display = hit.address.city || hit.address.city_district || hit.address.town || hit.address.village;
                    if (!_.isUndefined(county) && _.isUndefined(display)) {
                        display = county;
                    }
                    if (!_.isUndefined(weg)) {
                        display = display + ", " + weg;
                        if (!_.isUndefined(hit.address.house_number)) {
                            display = display + " " + hit.address.house_number;
                        }
                    }

                    // Tooltip
                    metaName = display;
                    if (!_.isUndefined(hit.address.postcode) && !_.isUndefined(hit.address.state)) {
                        metaName = metaName + ", " + hit.address.postcode + " " + hit.address.state;
                        if (!_.isUndefined(hit.address.suburb)) {
                            metaName = metaName + " (" + hit.address.suburb + ")";
                        }
                    }

                    bbox = hit.boundingbox;
                    if (!_.isUndefined(hit.address.house_number)) {
                        // Zentrum der BoundingBox ermitteln und von lat/lon ins Zielkoordinatensystem transformieren...
                        north = (parseFloat(bbox[0]) + parseFloat(bbox[1])) / 2.0;
                        east = (parseFloat(bbox[2]) + parseFloat(bbox[3])) / 2.0;
                        center = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [east, north]);
                    }
                    else {
                        upper = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [parseFloat(bbox[3]), parseFloat(bbox[1])]);
                        lower = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [parseFloat(bbox[2]), parseFloat(bbox[0])]);
                        center = [
                            lower[0],
                            lower[1],
                            upper[0],
                            upper[1]
                        ];
                    }
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        name: display,
                        metaName: metaName,
                        type: "OpenStreetMap",
                        osm: true,
                        glyphicon: "glyphicon-road",
                        id: _.uniqueId("osmSuggest"),
                        marker: hit.class === "building",
                        coordinate: center
                    });
                }
            }
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList", "osm");
    },

    /**
     * Determines whether the result contains all entered parameters.
     * @param  {object[]} searched - The search result to be examined.
     * @param  {array[]} params - The split result.
     * @returns {boolean} true | false
     */
    isSearched: function (searched, params) {
        var hits = [],
            address = searched.address;

        if (this.canShowHit(searched)) {

            _.each(params, function (param) {
                if ((_.has(address, "house_number") && address.house_number !== null && address.house_number.toLowerCase() === param.toLowerCase()) ||
                    (_.has(address, "road") && address.road !== null && address.road.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "pedestrian") && address.pedestrian !== null && address.pedestrian.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "county") && address.county !== null && address.county.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "city") && address.city !== null && address.city.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "city_district") && address.city_district !== null && address.city_district.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "town") && address.town !== null && address.town.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "village") && address.village !== null && address.village.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (_.has(address, "suburb") && address.suburb !== null && address.suburb.toLowerCase().indexOf(param.toLowerCase()) > -1)
                ) {
                    hits.push(param);
                }
            });
        }

        return params.length === hits.length;
    },

    /**
     * Determines whether the hit is displayed by the parameters or not.
     * @param  {Object} hit - search hits
     * @returns {boolean} true | false
     */
    canShowHit: function (hit) {
        var result = false,
            classesToShow = this.get("classes");

        if (classesToShow.length === 0) {
            return true;
        }

        _.each(classesToShow, function (classToShow) {
            if (hit.class === classToShow || !_.isUndefined(hit.extratags[classToShow])) {
                result = true;
            }
        });

        return result;
    },

    /**
     * Abortet ggf. vorhandenen Request und initiiert neuen Request.
     * @param {String} url - URL the request is sent to.
     * @param {String} data - Data to be sent to the server
     * @param {function} successFunction - A function to be called if the request succeeds
     * @returns {void}
     */
    sendRequest: function (url, data, successFunction) {
        var ajax = this.get("ajaxRequest");

        if (!_.isNull(ajax)) {
            ajax.abort();
            this.polishAjax();
        }
        this.ajaxSend(url, data, successFunction);
    },

    /**
     * Fires an HTTP GET request and saves its id.
     * @param  {String} url - todo
     * @param  {JSON} data - todo
     * @param  {function} successFunction - todo
     * @return {void}
     */
    ajaxSend: function (url, data, successFunction) {
        this.setAjaxRequest($.ajax({
            url: url,
            data: data,
            dataType: "json",
            context: this,
            type: "GET",
            success: successFunction,
            timeout: 6000,
            error: function (err) {
                if (err.status !== 0) { // Bei abort keine Fehlermeldung
                    this.showError(err);
                }
                Radio.trigger("Searchbar", "abortSearch", "osm");
            },
            complete: function () {
                this.polishAjax();
            }
        }));
    },

    /**
     * Triggers the display of an error message.
     * @param {object} err - Error object from Ajax request.
     * @returns {void}
     */
    showError: function (err) {
        var detail = err.statusText && err.statusText !== "" ? err.statusText : "";

        Radio.trigger("Alert", "alert", "OpenStreetMap-Suche nicht erreichbar. " + detail);
    },

    /**
     * todo
     * @returns {void}
     */
    polishAjax: function () {
        this.setAjaxRequest(null);
    },

    /**
     * Setter for inUse.
     * @param {*} value - todo
     * @returns {void}
     */
    setInUse: function (value) {
        this.set("inUse", value);
    },

    /**
     * Setter for osmServiceUrl.
     * @param {*} value - todo
     * @returns {void}
     */
    setOsmServiceUrl: function (value) {
        this.set("osmServiceUrl", value);
    },

    /**
     * Setter for limit.
     * @param {*} value - todo
     * @returns {void}
     */
    setLimit: function (value) {
        this.set("limit", value);
    },

    /**
     * Setter for states.
     * @param {*} value - todo
     * @returns {void}
     */
    setStates: function (value) {
        this.set("states", value);
    },

    /**
     * Setter for street.
     * @param {*} value - todo
     * @returns {void}
     */
    setStreet: function (value) {
        this.set("street", value);
    },

    /**
     * Setter for searchParams.
     * @param {*} value - todo
     * @returns {void}
     */
    setSearchParams: function (value) {
        this.set("searchParams", value);
    },

    /**
     * Setter for classes.
     * @param {*} value - todo
     * @returns {void}
     */
    setClasses: function (value) {
        this.set("classes", value.split(","));
    },

    /**
     * Setter for minChars.
     * @param {*} value - todo
     * @returns {void}
     */
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    /**
     * Setter for ajaxRequest.
     * @param {*} value - todo
     * @returns {void}
     */
    setAjaxRequest: function (value) {
        this.set("ajaxRequest", value);
    }
});

export default OsmModel;
