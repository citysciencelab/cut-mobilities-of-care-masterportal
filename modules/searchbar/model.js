define([
    "backbone",
    "eventbus"
    ], function (Backbone, EventBus) {
    "use strict";
    var SearchbarModel = Backbone.Model.extend({
        defaults: {
            placeholder: "Suche",
            recommandedListLength: 5,
            quickHelp: false,
            searchString: "", // der aktuelle String in der Suchmaske
            hitList: []
        },
        /**
        *
        */
        initialize: function () {
            this.on("change:searchString", this.checkStringAndSearch, this);

            EventBus.on("createRecommendedList", this.createRecommendedList, this);
            EventBus.on("searchbar:pushHits", this.pushHits, this);
        },

        /**
        * aus View gaufgerufen
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
            var max = this.get("recommandedListLength");

            if (this.get("hitList").length > 0) {
                this.set("isHitListReady", false);
                if (this.get("hitList").length > max) {
                    var hitList = this.get("hitList"),
                        foundTypes = [],
                        singleTypes = _.reject(hitList, function (hit) {
                            if (_.contains(foundTypes, hit.type) === true || foundTypes.length === max) {
                                return true;
                            }
                            else {
                                foundTypes.push(hit.type);
                            }
                        });
                    while (singleTypes.length < max) {
                        var randomNumber = _.random(0, hitList.length - 1);

                        singleTypes.push(hitList[randomNumber]);
                        hitList.splice(randomNumber, 1);
                    }
                    this.set("recommendedList", singleTypes);
                }
                else {
                    this.set("recommendedList", this.get("hitList"));
                }
                this.set("isHitListReady", true);
            }
        }
    });

    return new SearchbarModel();
});
