define(function (require) {
    var Config = require("config"),
        $ = require("jquery"),
        SearchbarModel;

    SearchbarModel = Backbone.Model.extend({
        defaults: {
            placeholder: "Suche",
            recommandedListLength: 5,
            quickHelp: false,
            searchString: "", // der aktuelle String in der Suchmaske
            hitList: [],
            minChars: ""
            // isHitListReady: true
        },

        initialize: function () {
            if (Config.quickHelp) {
                this.set("quickHelp", Config.quickHelp);
            }
            this.listenTo(Radio.channel("Searchbar"), {
                "createRecommendedList": this.createRecommendedList,
                "pushHits": this.pushHits,
                "removeHits": this.removeHits
            });

            if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
                this.setInitSearchString(Radio.request("ParametricURL", "getInitString"));
            }
        },

        setInitSearchString: function (value) {
            this.set("initSearchString", value);
        },

        setSearchString: function (value, eventType) {
            var splitAdress = value.split(" "),
                streetName,
                houseNumber;

            // für Copy/Paste bei Adressen
            if (splitAdress.length > 1 && splitAdress[splitAdress.length - 1].match(/\d/) && eventType === "paste") {
                houseNumber = splitAdress[splitAdress.length - 1];
                streetName = value.substr(0, value.length - houseNumber.length - 1);

                this.set("searchString", streetName);
                Radio.trigger("Searchbar", "setPastedHouseNumber", houseNumber);
            }
            else {
                this.set("searchString", value);
            }
            this.set("hitList", []);
            Radio.trigger("Searchbar", "search", this.get("searchString"));
            $(".dropdown-menu-search").show();
        },
        /**
         * Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * @param {String} attribute - Das Attribut das gesetzt werden soll
         * @param {whatever} value - Der Wert des Attributs
         * @returns {void}
         */
        pushHits: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        },

        /**
         * removes all hits with the given filter
         * @param {object} attribute -
         * @param {object} filter -
         * @returns {void}
         */
        removeHits: function (attribute, filter) {
            var toRemove, i,
                tempArray = _.clone(this.get(attribute));

            if (_.isObject(filter)) {
                toRemove = _.filter(tempArray, function (obj) {
                    return _.where(obj, filter);
                });
                _.each(toRemove, function (item) {
                    tempArray.splice(tempArray.indexOf(item), 1);
                });
            }
            else {
                for (i = tempArray.length - 1; i >= 0; i--) {
                    if (tempArray[i] === filter) {
                        tempArray.splice(i, 1);
                    }
                }
            }
            this.set(attribute, _.flatten(tempArray));
        },

        /**
         * changes the filename extension of given filepath
         * @param  {[type]} src [description]
         * @param  {[type]} ext     [description]
         * @return {[type]}         [description]
         */
        changeFileExtension: function (src, ext) {
            if (_.isUndefined(src)) {
                return src;
            }
            if (src.substring(src.lastIndexOf("."), src.length) !== ext) {
                return src.substring(0, src.lastIndexOf(".")) + ext;
            }
            return src;
        },
        /**
         * crops names of hits to length zeichen
         * @param  {[type]} s [the search result]
         * @param  {[type]} length  [name length]
         * @returns {string} s
         */
        shortenString: function (s, length) {
            if (_.isUndefined(s)) {
                return s;
            }
            if (s.length > length && length > 0) {
                return s.substring(0, length).trim() + "..";
            }
            return s;
        },

        createRecommendedList: function () {
            var max = this.get("recommandedListLength"),
                hitList,
                foundTypes,
                singleTypes,
                usedNumbers,
                randomNumber,
                recommendedList = [];

            // if (this.get("hitList").length > 0 && this.get("isHitListReady") === true) {
            //     this.set("isHitListReady", false);
            if (this.get("hitList").length > max) {
                hitList = this.get("hitList");
                foundTypes = [];
                singleTypes = _.reject(hitList, function (hit) {
                    if (_.contains(foundTypes, hit.type) === true || foundTypes.length === max) {
                        return true;
                    }
                    foundTypes.push(hit.type);
                });
                usedNumbers = [];

                while (singleTypes.length < max) {
                    randomNumber = _.random(0, hitList.length - 1);
                    if (_.contains(usedNumbers, randomNumber) === false) {
                        singleTypes.push(hitList[randomNumber]);
                        usedNumbers.push(randomNumber);
                        singleTypes = _.uniq(singleTypes);
                    }
                }
                recommendedList = singleTypes;
            }
            else {
                recommendedList = this.get("hitList");
            }
            this.set("recommendedList", _.sortBy(recommendedList, "name"));
            // this.set("isHitListReady", true);
            // }
        }
    });

    return SearchbarModel;
});
