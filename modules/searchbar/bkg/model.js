define([
    "backbone",
    "eventbus",
    "modules/searchbar/model"
    ], function (Backbone, EventBus) {
    "use strict";
    return Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            minChars: 3,
            bkgSuggestURL: "",
            bkgSearchURL: "",
            extent: [454591, 5809000, 700000, 6075769],
            epsg: "EPSG:25832",
            filter: "filter=(typ:*)",
            score: 0.6
        },
        /**
         * @description Initialisierung der BKG Suggest Suche
         * @param {integer} minChars - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @param {string} bkgSuggestURL - URL für schnelles Suggest.
         * @param {string} bkgSearchURL - URL für ausführliche Search.
         * @param {[float]} extent - Koordinatenbasierte Ausdehnung in der gesucht wird.
         * @param {string} epsg - EPSG-Code des verwendeten Koordinatensystems.
         * @param {string} filter - Filterstring
         * @param {float} score - Score-Wert, der die Qualität der Ergebnisse auswertet.
         */
        initialize: function (config) {
            this.set("bkgSuggestURL", config.bkgSuggestURL);
            if (config.minChars) {
                this.set("minChars", config.minChars);
            }
            if (config.bkgSearchURL) {
                this.set("bkgSearchURL", config.bkgSearchURL);
            }
            if (config.extent) {
                this.set("extent", config.extent);
            }
            if (config.epsg) {
                this.set("epsg", config.epsg);
            }
            if (config.filter) {
                this.set("filter", config.filter);
            }
            if (config.score) {
                this.set("score", config.score);
            }
            EventBus.on("searchbar:search", this.search, this);
            EventBus.on("bkg:bkgSearch", this.bkgSearch, this);
        },
        /**
        * Wird von der Searchbar getriggert.
        */
        search: function (searchString) {
            if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
                this.set("inUse", true);
                this.suggestByBKG(searchString);
                EventBus.trigger("createRecommendedList");
                this.set("inUse", false);
            }
        },
        /**
         *
         */
        suggestByBKG: function (searchString) {
            var request = "bbox=" + this.get("extent") + "&outputformat=json" + "&srsName=" + this.get("epsg") + "&query=" + encodeURIComponent(searchString) + "&" + this.get("filter");

            this.sendRequest(this.get("bkgSuggestURL"), request, this.pushSuggestions, true);
        },
        /**
         * [pushSuggestions description]
         * @param  {[type]} data [description]
         */
        pushSuggestions: function (data) {
            _.each(data, function (hit) {
                if (hit.score > this.get("score")) {
                    EventBus.trigger("searchbar:pushHits", "hitList", {
                        name: hit.suggestion,
                        type: "Ortssuche",
                        bkg: true,
                        glyphicon: "glyphicon-road",
                        id: hit.suggestion
                    });
                }
            }, this);
        },
        /**
         * [bkgSearch description]
         * @param  {string} name - Gesuchter String
         */
        bkgSearch: function (name) {
            var request = "bbox=" + this.get("extent") + "&outputformat=json" + "&srsName=" + this.get("epsg") + "&count=15" + "&query=" + name;

            this.sendRequest(this.get("bkgSearchURL"), request, this.handleBKGSearchResult, true, this);
        },
        handleBKGSearchResult: function (result) {
            EventBus.trigger("searchInput:showBKGSearchResult", result);
        },
        /**
         * @description Führt einen HTTP-GET-Request aus.
         *
         * @param {String} url - URL the request is sent to.
         * @param {String} data - Data to be sent to the server
         * @param {function} successFunction - A function to be called if the request succeeds
         * @param {boolean} asyncBool - asynchroner oder synchroner Request
         */
        sendRequest: function (url, data, successFunction, asyncBool) {
            $.ajax({
                url: url,
                data: data,
                context: this,
                async: asyncBool,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                error: function () {
                    EventBus.trigger("alert", url + " nicht erreichbar.");
                }
            });
        }
    });
});
