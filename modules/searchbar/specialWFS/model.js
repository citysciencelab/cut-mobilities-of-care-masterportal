define([
    "backbone",
    "eventbus"
    ], function (Backbone, EventBus) {
    "use strict";
    return Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: false,
            minChar: 3,
            bPlans: [],
            olympia: []
        },
        /**
         * @description Initialisierung der wfsFeature Suche
         * @param {integer} minChar - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @type {Objekt[]} Das Konfigurationsarray für die specialWFS-Suche
         * @param {string} url - Die URL, des WFS
         * @param {string} data - Query string des WFS-Request
         * @param {string} name - Name der speziellen Filterfunktion (bplan|olympia|paralympia)
         */
        initialize: function (config) {
            if (config.minChar) {
                this.set("minChar", config.minChar);
            }
            _.each(config.definitions, function (element) {
                if (element.name === "olympia") {
                    this.sendRequest(element.url, element.data, this.getFeaturesForOlympia, false);
                }
                else if (element.name === "paralympia") {
                    this.sendRequest(element.url, element.data, this.getFeaturesForParalympia, false);
                }
                else if (element.name === "bplan") {
                    this.sendRequest(element.url, element.data, this.getFeaturesForBPlan, false);
                }
            }, this);
            EventBus.on("searchbar:search", this.search, this);
        },
        /**
        *
        */
        search: function (searchString) {
            if (this.get("inUse") === false) {
                this.set("inUse", true);
                var searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"); // Erst join dann als regulärer Ausdruck

                if (this.get("olympia").length > 0 && searchString.length >= this.get("minChar")) {
                    this.searchInOlympiaFeatures(searchStringRegExp);
                }
                if (this.get("bPlans").length > 0 && searchString.length >= this.get("minChar")) {
                    this.searchInBPlans(searchStringRegExp);
                }
                this.set("inUse", false);
            }
        },
        /**
        *
        */
        searchInBPlans: function (searchStringRegExp) {
            _.each(this.get("bPlans"), function (bPlan) {
                // Prüft ob der Suchstring ein Teilstring vom B-Plan ist
                if (bPlan.name.search(searchStringRegExp) !== -1) {
                    EventBus.trigger("searchbar:pushHits", "hitList", bPlan);
                }
            }, this);
            EventBus.trigger("createRecommendedList");
        },
        /**
        *
        */
        searchInOlympiaFeatures: function (searchStringRegExp) {
            _.each(this.get("olympia"), function (feature) {
                _.each(feature.name.split(","), function (ele) {
                    var eleName = ele.replace(/ /g, "");
                    // Prüft ob der Suchstring ein Teilstring vom Feature ist
                    if (eleName.search(searchStringRegExp) !== -1) {
                        EventBus.trigger("searchbar:pushHits", "hitList", {
                            name: ele,
                            type: feature.type,
                            coordinate: feature.coordinate,
                            glyphicon: "glyphicon-fire",
                            id: feature.id
                        });
                    }
                }, this);
            }, this);
            EventBus.trigger("createRecommendedList");
        },
        /**
         * success-Funktion für die Olympiastandorte. Schreibt Ergebnisse in "bplan".
         * @param  {xml} data - getFeature-Request
         */
        getFeaturesForBPlan: function (data) {
            var hits = $("wfs\\:member,member", data),
                name,
                type;

            _.each(hits, function (hit) {
                if ($(hit).find("app\\:planrecht, planrecht")[0] !== undefined) {
                    name = $(hit).find("app\\:planrecht, planrecht")[0].textContent;
                    type = "festgestellt";
                }
                else {
                    name = $(hit).find("app\\:plan, plan")[0].textContent;
                    type = "im Verfahren";
                }
                // BPlan-Objekte
                this.get("bPlans").push({
                    name: name.trim(),
                    type: type,
                    glyphicon: "glyphicon-picture",
                    id: name.replace(/ /g, "") + "BPlan"
                });
            }, this);
        },
        /**
         * success-Funktion für die Olympiastandorte. Schreibt Ergebnisse in "olypia".
         * @param  {xml} data - getFeature-Request
         */
        getFeaturesForOlympia: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinate,
                position,
                hitType,
                hitName;

            _.each(hits, function (hit) {
               if ($(hit).find("gml\\:pos,pos")[0] !== undefined) {
                    position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                    coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                    if ($(hit).find("app\\:piktogramm, piktogramm")[0] !== undefined && $(hit).find("app\\:art,art")[0].textContent !== "Umring") {
                        hitName = $(hit).find("app\\:piktogramm, piktogramm")[0].textContent;
                        hitType = $(hit).find("app\\:staette, staette")[0].textContent;
                        // Olympia-Objekte
                        this.get("olympia").push({
                            name: hitName,
                            type: "Olympiastandort",
                            coordinate: coordinate,
                            glyphicon: "glyphicon-fire",
                            id: hitName.replace(/ /g, "") + "Olympia"
                        });
                    }
               }
            }, this);
        },
        /**
         * success-Funktion für die Paralympiastandorte. Schreibt Ergebnisse in "olypia".
         * @param  {xml} data - getFeature-Request
         */
        getFeaturesForParalympia: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinate,
                position,
                hitType,
                hitName;

            _.each(hits, function (hit) {
               if ($(hit).find("gml\\:pos,pos")[0] !== undefined) {
                    position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                    coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                    if ($(hit).find("app\\:piktogramm, piktogramm")[0] !== undefined && $(hit).find("app\\:art,art")[0].textContent !== "Umring") {
                        hitName = $(hit).find("app\\:piktogramm, piktogramm")[0].textContent;
                        hitType = $(hit).find("app\\:staette, staette")[0].textContent;
                        // Olympia-Objekte
                        this.get("olympia").push({
                            name: hitName,
                            type: "Paralympiastandort",
                            coordinate: coordinate,
                            glyphicon: "glyphicon-fire",
                            id: hitName.replace(/ /g, "") + "Paralympia"
                        });
                    }
               }
            }, this);
        },
        /**
         * @description Führt einen HTTP-GET-Request aus.
         *
         * @param {String} url - A string containing the URL to which the request is sent
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
