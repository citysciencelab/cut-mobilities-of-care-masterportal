define([
    "backbone",
    "backbone.radio",
    "modules/searchbar/model"
    ], function (Backbone, Radio) {
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
            suggestCount: 20,
            epsg: "EPSG:25832",
            filter: "filter=(typ:*)",
            score: 0.6
        },
        /**
         * @description Initialisierung der BKG Suggest Suche
         * @param {Object} config - Das Konfigurationsobjet der BKG Suche.
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @param {string} config.suggestServiceId - ID aus rest-services für URL für schnelles Suggest.
         * @param {string} [config.geosearchServiceId] - ID aus rest-services für URL für ausführliche Search.
         * @param {[float]} [config.extent=454591, 5809000, 700000, 6075769] - Koordinatenbasierte Ausdehnung in der gesucht wird.
         * @param {integer} [config.suggestCount=20] - Anzahl der über suggest angefragten Vorschläge.
         * @param {string} [config.epsg=EPSG:25832] - EPSG-Code des verwendeten Koordinatensystems.
         * @param {string} [config.filter=filter=(typ:*)] - Filterstring
         * @param {float} [config.score=0.6] - Score-Wert, der die Qualität der Ergebnisse auswertet.
         */
        initialize: function (config) {
            var suggestService = Radio.request("RestReader", "getServiceById", config.suggestServiceId),
                geosearchService = Radio.request("RestReader", "getServiceById", config.geosearchServiceId);

            if (suggestService && suggestService.get("url")) {
                this.set("bkgSuggestURL", suggestService.get("url"));
            }

            if (geosearchService && geosearchService.get("url")) {
                this.set("bkgSearchURL", geosearchService.get("url"));
            }

            if (config.minChars) {
                this.set("minChars", config.minChars);
            }
            if (config.extent) {
                this.set("extent", config.extent);
            }
            if (config.suggestCount) {
                this.set("suggestCount", config.suggestCount);
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

            this.listenTo(Radio.channel("Searchbar"), {
                "bkgSearch": this.bkgSearch,
                "search": this.search
            });
        },
        /**
        * Wird von der Searchbar getriggert.
        */
        search: function (searchString) {
            if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
                this.set("inUse", true);
                this.suggestByBKG(searchString);
                Radio.trigger("Searchbar", "createRecommendedList");
                this.set("inUse", false);
            }
        },
        /**
         *
         */
        suggestByBKG: function (searchString) {
            var request = "bbox=" + this.get("extent") + "&outputformat=json" + "&srsName=" + this.get("epsg") + "&query=" + encodeURIComponent(searchString) + "&" + this.get("filter") + "&count=" + this.get("suggestCount");

            this.sendRequest(this.get("bkgSuggestURL"), request, this.pushSuggestions, false);
        },
        /**
         * [pushSuggestions description]
         * @param  {[type]} data [description]
         */
        pushSuggestions: function (data) {
            _.each(data, function (hit) {
                if (hit.score > this.get("score")) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        name: hit.suggestion,
                        type: "Ort",
                        bkg: true,
                        glyphicon: "glyphicon-road",
                        id: _.uniqueId("bkgSuggest")
                    });
                }
            }, this);
        },
        /**
         * [bkgSearch description]
         * @param  {string} name - Gesuchter String
         */
        bkgSearch: function (name) {
            var request = "bbox=" + this.get("extent") + "&outputformat=json" + "&srsName=" + this.get("epsg") + "&count=1" + "&query=" + encodeURIComponent(name);

            this.sendRequest(this.get("bkgSearchURL"), request, this.handleBKGSearchResult, true, this);
        },
        /**
         * @description Triggert das Zoomen auf den Eintrag
         * @param  {string} data - Data-XML des request
         */
        handleBKGSearchResult: function (data) {
            Radio.trigger("MapMarker", "zoomToBKGSearchResult", data);
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
                    Radio.trigger("Alert", "alert", url + " nicht erreichbar.");
                }
            });
        }
    });
});
