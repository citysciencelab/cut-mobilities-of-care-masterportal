define([
    "backbone",
    "openlayers",
    "modules/layer/list",
    "eventbus",
    "config"
    ], function (Backbone, ol, LayerList, EventBus, Config) {
        /**
        *
        */
        Searchbar = Backbone.Model.extend({

            /**
            *
            */
            defaults: {
                placeholder: Config.searchBar.placeholder,
                searchString: "", // der aktuelle String in der Suchmaske
                hitList: [],
                onlyOneStreetName: "", // speichert den Namen der Straße, wenn die Straßensuche nur noch eine Treffer zurückgibt.
                marker: new ol.Overlay({
                    positioning: "bottom-center",
                    element: $("#searchMarker"), // Element aus der index.html
                    stopEvent: false
                })
            },

            /**
            *
            */
            initialize: function () {
                this.on("change:searchString", this.checkStringAndSearch, this);
                EventBus.on("createRecommendedList", this.createRecommendedList, this);
                EventBus.on("searchbar:pushHits", this.pushHits, this);

                // Initiale Suche query=...
                if (Config.searchBar.initString !== undefined) {
                    if (Config.searchBar.initString.search(",") !== -1) {
                        var splitInitString = Config.searchBar.initString.split(",");

                        this.set("onlyOneStreetName", splitInitString[0]);
                        // this.set("isOnlyOneStreet", true);
                        this.set("searchString", splitInitString[0] + " " + splitInitString[1]);
                    }
                    else {
                        this.set("searchString", Config.searchBar.initString);
                    }
                }

                // Quick-Help
                if (Config.quickHelp && Config.quickHelp === true) {
                    this.set("quickHelp", true);
                }
                else {
                    this.set("quickHelp", false);
                }
                EventBus.trigger("addOverlay", this.get("marker"));
            },

            /**
            *
            */
            setSearchString: function (value) {
                this.set("searchString", value);
            },
            /**
             * Hilfsmethode um ein Attribut vom Typ Array zu setzen.
             * {String} attribute - Das Attribut das gesetzt werden soll
             * {whatever} value - Der Wert des Attributs
             */
            pushHits: function (attribute, value) {
                var tempArray = _.clone(this.get(attribute));
console.log(attribute);
                tempArray.push(value);
                this.set(attribute, _.flatten(tempArray));
            },
            /**
            *
            */
            checkStringAndSearch: function () {
                this.set("hitList", []);
                EventBus.trigger("searchbar:search", this.get("searchString"));
            },
            /**
            *
            */
            createRecommendedList: function () {
                this.set("isHitListReady", false);
                if (Config.searchBar.useBKGSearch) {
                    if (this.get("hitList").length > 5) {
                        var suggestList = this.get("hitList"),
                        // bkg Ergebnisse von anderen trennen
                        split = _.partition(suggestList, function (obj) {
                            return (obj.bkg === true);
                        }),
                        // Beide Listen kürzen und anschließend wieder vereinigen
                        // Damit aus beiden Ergebnistypen gleichviele angezeigt werden
                        shortHitlist = _.first(split[0], 5),
                        shortHitlist2 = _.first(split[1], 5);

                        this.set("recommendedList", _.union(shortHitlist2, shortHitlist));
                    }
                    else {
                        this.set("recommendedList", this.get("hitList"));
                    }
                    this.set("isHitListReady", true);
                    return;
                }

                if (this.get("hitList").length > 5) {
                    var numbers = [];

                    while (numbers.length < 5) {
                        var randomNumber = _.random(0, this.get("hitList").length - 1);

                        if (_.contains(numbers, randomNumber) === false) {
                            numbers.push(randomNumber);
                        }
                    }
                    var mapHitList = _.map(numbers, function (number) {
                        return this.get("hitList")[number];
                    }, this);

                    this.set("recommendedList", mapHitList);
                }
                else {
                    this.set("recommendedList", this.get("hitList"));
                }
                this.set("isHitListReady", true);
            }
        });

        return new Searchbar();
    });
