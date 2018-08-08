define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        $ = require("jquery"),
        BKGSearchModel;

    require("modules/searchbar/model");

    BKGSearchModel = Backbone.Model.extend({
        defaults: {
            minChars: 3,
            bkgSuggestURL: "",
            bkgSearchURL: "",
            extent: [
                454591, 5809000, 700000, 6075769
            ],
            suggestCount: 20,
            epsg: "EPSG:25832",
            filter: "filter=(typ:*)",
            score: 0.6,
            ajaxRequests: {},
            typeOfRequest: ""
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
         * @returns {void}
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
            if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
                this.directSearch(Radio.request("ParametricURL", "getInitString"));
            }

            this.listenTo(Radio.channel("Searchbar"), {
                "bkgSearch": this.bkgSearch,
                "search": this.search
            });
        },
        /**
        * @description Veränderte Suchabfolge bei initialer Suche z.B. furch URL-Parameter query
        * @param {string} searchString - Suchstring
        * @returns {void}
        */
        directSearch: function (searchString) {
            var request;

            if (searchString.length >= this.get("minChars")) {
                $("#searchInput").val(searchString);
                request = "bbox=" + this.get("extent") + "&outputformat=json&srsName=" + this.get("epsg") + "&query=" + encodeURIComponent(searchString) + "&" + this.get("filter") + "&count=" + this.get("suggestCount");
                this.setTypeOfRequest("direct");
                this.sendRequest(this.get("bkgSuggestURL"), request, this.directPushSuggestions, false, this.get("typeOfRequest"));
                Radio.trigger("Searchbar", "createRecommendedList");
            }
        },
        directPushSuggestions: function (data) {
            if (data.length === 1) {
                this.bkgSearch({
                    name: data[0].suggestion
                });
            }
            else {
                _.each(data, function (hit) {
                    if (hit.score > this.get("score")) {
                        Radio.trigger("Searchbar", "pushHits", "hitList", {
                            name: hit.suggestion,
                            type: "Ort",
                            bkg: true,
                            glyphicon: "glyphicon-road",
                            id: _.uniqueId("bkgSuggest"),
                            triggerEvent: {
                                channel: "Searchbar",
                                event: "bkgSearch"
                            }
                        });
                    }
                }, this);
            }
        },

        /**
         * Startet die Suche
         * @param  {string} searchString Suchpattern
         * @return {void}
         */
        search: function (searchString) {
            if (searchString.length >= this.get("minChars")) {
                this.suggestByBKG(searchString);
            }
        },

        suggestByBKG: function (searchString) {
            var request = "bbox=" + this.get("extent") + "&outputformat=json&srsName=" + this.get("epsg") + "&query=" + encodeURIComponent(searchString) + "&" + this.get("filter") + "&count=" + this.get("suggestCount");

            this.setTypeOfRequest("suggest");
            this.sendRequest(this.get("bkgSuggestURL"), request, this.pushSuggestions, true, this.get("typeOfRequest"));
        },

        /**
         * Fügt die Vorschläge den Suchtreffern hinzu
         * @param  {[object]} data Array der Treffer
         * @return {void}
         */
        pushSuggestions: function (data) {
            _.each(data, function (hit) {
                if (hit.score > this.get("score")) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        name: hit.suggestion,
                        type: "Ort",
                        bkg: true,
                        glyphicon: "glyphicon-road",
                        id: _.uniqueId("bkgSuggest"),
                        triggerEvent: {
                            channel: "Searchbar",
                            event: "bkgSearch"
                        }
                    });
                }
            }, this);
            Radio.trigger("Searchbar", "createRecommendedList");
        },

        /**
         * Startet die präzise Suche eines ausgewählten BKG-Vorschlags
         * @param  {object} hit Objekt des BKG-Vorschlags
         * @return {void}
         */
        bkgSearch: function (hit) {
            var name = hit.name,
                request = "bbox=" + this.get("extent") + "&outputformat=json&srsName=" + this.get("epsg") + "&count=1&query=" + encodeURIComponent(name);

            this.setTypeOfRequest("search");
            this.sendRequest(this.get("bkgSearchURL"), request, this.handleBKGSearchResult, true, this.get("typeOfRequest"));
        },
        /**
         * @description Triggert das Zoomen auf den Eintrag
         * @param  {string} data - Data-XML des request
         * @returns {void}
         */
        handleBKGSearchResult: function (data) {
            Radio.trigger("MapMarker", "zoomToBKGSearchResult", data);
        },
        /**
         * @description Führt einen HTTP-GET-Request aus.
         * @param {String} url - URL the request is sent to.
         * @param {String} data - Data to be sent to the server
         * @param {function} successFunction - A function to be called if the request succeeds
         * @param {boolean} asyncBool - asynchroner oder synchroner Request
         * @param {String} type - Typ des Requests
         * @returns {void}
         */
        sendRequest: function (url, data, successFunction, asyncBool, type) {
            var ajax = this.get("ajaxRequests");

            if (ajax[type] !== null && !_.isUndefined(ajax[type])) {
                ajax[type].abort();
                this.polishAjax(type);
            }
            this.ajaxSend(url, data, successFunction, asyncBool, type);
        },

        ajaxSend: function (url, data, successFunction, asyncBool, typeRequest) {
            this.get("ajaxRequests")[typeRequest] = $.ajax({
                url: url,
                data: data,
                dataType: "json",
                context: this,
                async: asyncBool,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                typeRequest: typeRequest,
                error: function (err) {
                    if (err.status !== 0) { // Bei abort keine Fehlermeldung
                        this.showError(err);
                    }
                },
                complete: function () {
                    this.polishAjax(typeRequest);
                }
            }, this);
        },

        /**
         * Triggert die Darstellung einer Fehlermeldung
         * @param {object} err Fehlerobjekt aus Ajax-Request
         * @returns {void}
         */
        showError: function (err) {
            var detail = err.statusText && err.statusText !== "" ? err.statusText : "";

            Radio.trigger("Alert", "alert", "BKG-Adressdienst nicht erreichbar. " + detail);
        },

        /**
         * Löscht die Information des erfolgreichen oder abgebrochenen Ajax-Requests wieder aus dem Objekt der laufenden Ajax-Requests
         * @param {string} type Bezeichnung des Typs
         * @returns {void}
         */
        polishAjax: function (type) {
            var ajax = this.get("ajaxRequests"),
                cleanedAjax = _.omit(ajax, type);

            this.set("ajaxRequests", cleanedAjax);
        },

        /**
         * Setzt den RequestTyp
         * @param {string} value neuer Wert
         * @returns {void}
         */
        setTypeOfRequest: function (value) {
            this.set("typeOfRequest", value);
        }
    });

    return BKGSearchModel;
});
