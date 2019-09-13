import "../model";
import {search} from "masterportalAPI/src/searchAddress/search";
import {setGazetteerUrl} from "masterportalAPI/src/searchAddress/gazetteerUrl";

const GazetteerModel = Backbone.Model.extend(/** @lends GazetteerModel.prototype */{
    defaults: {
        minCharacters: 3,
        serviceId: "88",
        searchStreets: false,
        searchHouseNumbers: false,
        searchDistricts: false,
        searchParcels: false,
        searchStreetKey: false,
        searchAddress: false,
        searchHouseNumbersThresholdMaxStreets: 4,
        map: null
    },

    /**
     * @class GazetteerModel
     * @extends Backbone.Model
     * @memberof Searchbar.Gaz
     * @constructs
     * @description Initialisierung der Gazetteer Suche
     * @property {number} [minCharacters=3] - Minimum number of characters in the search string before the search is initiated.
     * @property {String} [serviceId=88] - Id to services from rest-services.json to get URL for gazetter service.
     * @property {boolean} [searchStreets=false] - Should street names be searched? Prerequisite for searchHouseNumbers.
     * @property {boolean} [searchHouseNumbers=false] - Should house numbers also be searched for or only streets?
     * @property {boolean} [searchDistricts=false] - Do you want to search for districts?
     * @property {boolean} [searchParcels=false] - Do you want to search for parcels?
     * @property {boolean} [searchStreetKey=false] - Do you want to search for searchStreetKey?
     * @property {boolean} [searchAddress=false] - Do you want to search for searchAddress, street with housenumber?
     * @property {number} [searchHouseNumbersThresholdMaxStreets=4] - Threshold value under which number of street found should also be searched for house numbers.
     * @property {Object} [map=null] - Map on which the search result is to be displayed.
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     */
    initialize: function () {
        const gazService = Radio.request("RestReader", "getServiceById", this.get("serviceId"));

        setGazetteerUrl(gazService.get("url"));
        this.setMap(Radio.request("Map", "getMap"));

        /**
         * minChars
         * @deprecated in 3.0.0
         */
        if (this.get("minChars")) {
            console.warn("Searchbar Gazetter: Attribute 'minChars' is deprecated. Please use 'minCharacters'");
            this.setMinCharacters(this.get("minChars"));
        }

        this.listenTo(Radio.channel("Searchbar"), {
            "search": function (searchString) {
                this.search(searchString);
                Radio.trigger("Searchbar", "createRecommendedList");
            }
        });

        // this.listenTo(Radio.channel("Gaz"), {
        //     "findStreets": function (searchString) {
        //         this.search(searchString, {searchStreets: true});
        //     },
        //     "findHouseNumbers": function (searchString) {
        //         this.search(searchString, {searchStreets: true});
        //         Radio.trigger("Gaz", "houseNumbers", "sortedHouseNumbers");
        //     },
        //     "adressSearch": function (searchString) {
        //         this.search(searchString, {searchStreets: true});
        //     }
        // });
    },

    /**
     * Searches over the gazetter.
     * @param {String} searchString - String to search for
     * @param {Object} searchAttributes=this.getAttributesForSearchAsObject() - gazetter config paramas
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    search: function (searchString, searchAttributes = this.getAttributesForSearchAsObject()) {
        search(searchString, searchAttributes)
            .then(hits => {
                // hits.forEach(hit => Radio.trigger("Searchbar", "pushHits", "hitList", this.createHitForHitList(hit)));
                hits.forEach(hit => Radio.trigger("Searchbar", "pushHits", "hitList", this.createHitForHitList(hit)));
                // Radio.trigger("Searchbar", "createRecommendedList");
            }).catch(err => console.error(err));
    },

    /**
     * Converts a transferred hit into the format for the hitList of the searchbar.
     * @param {String} hit - Hit from Gazetter
     * @returns {Object} Hit for the hit list of searchbar
     */
    createHitForHitList: function (hit) {
        const translatedHitType = this.translateTypeName(hit.type),
            hitHausnummernzusatz = hit.properties.hasOwnProperty("hausnummernzusatz") ? hit.properties.hausnummernzusatz._ : "",
            hitName = hit.type === "addressUnaffixed" ? hit.name + hitHausnummernzusatz : hit.name;

        return {
            name: hitName,
            type: translatedHitType,
            coordinate: hit.geometry.coordinates,
            glyphicon: "glyphicon-map-marker",
            id: hitName.replace(/ /g, "") + translatedHitType
        };
    },

    /**
     * Translates the types supplied by the gazetter.
     * @param {String} hitType - Type from the hit of Gazetter
     * @returns {String} Translated hitType
     */
    translateTypeName: function (hitType) {
        const translateObject = {
            "street": "Straße",
            "houseNumbersForStreet": "Adresse",
            "parcel": "Parcel",
            "addressUnaffixed": "Adresse",
            "district": "Stadtteil"
        };

        return translateObject[hitType];
    },

    /**
     * Setter for map
     * @param {String} value - map
     * @returns {void}
     */
    setMap: function (value) {
        this.set("map", value);
    },

    /**
     * Setter for minCharacters
     * @param {String} value - minCharacters
     * @returns {void}
     */
    setMinCharacters: function (value) {
        this.set("minCharacters", value);
    },

    /**
     * Gets all neccessarry attributes for serach as Object.
     * @returns {Object} Parmas for Search
     */
    getAttributesForSearchAsObject: function () {
        return {
            map: this.get("map"),
            searchAddress: this.get("searchAddress"),
            searchStreets: this.get("searchStreets"),
            searchHouseNumbers: this.get("searchHouseNumbers"),
            searchDistricts: this.get("searchDistricts"),
            searchParcels: this.get("searchParcels"),
            searchStreetKey: this.get("searchStreetKey"),
            minCharacters: this.get("minCharacters")
        };
    }
});

export default GazetteerModel;
