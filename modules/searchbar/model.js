define(function (require) {
    var $ = require("jquery"),
        Config = require("config"),
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

        getInitSearchString: function () {
            return this.get("initSearchString");
        },

        /**
        * aus View gaufgerufen
        * @param {string} value - value from event
        * @param {string} eventType - type of the event
        * @returns {void}
        */
        setSearchString: function (value, eventType) {
            var splitAdress = value.split(" "),
                houseNumber,
                streetName;
console.log(value);
console.log(eventType);
console.log(splitAdress[splitAdress.length - 1].match(/\d/));

            // für Copy/Paste bei Adressen
            if (splitAdress.length > 1 && splitAdress[splitAdress.length - 1].match(/\d/) && eventType === "input") {
                console.log(eventType);
                
                houseNumber = splitAdress[splitAdress.length - 1];
                streetName = value.substr(0, value.length - houseNumber.length - 1);
console.log(houseNumber);
console.log(streetName);

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
         * {String} attribute - Das Attribut das gesetzt werden soll
         * {whatever} value - Der Wert des Attributs
         * @param  {[type]} attribute [description]
         * @param  {[type]} value     [description]
         * @return {[type]}         [description]
         */
        pushHits: function (attribute, value) {
            console.log(attribute);
            
            var tempArray = _.clone(this.get(attribute));
            console.log(tempArray);
            

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
            console.log(tempArray);
            
        },

        /**
         * removes all hits with the given filter
         * @param  {[type]} attribute [description]
         * @param  {[type]} filter     [description]
         * @return {[type]}         [description]
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
                recommendedList = [],
                hitList = this.get("hitList"),
                foundTypes = [],
                singleTypes,
                usedNumbers = [],
                randomNumber;

            // if (this.get("hitList").length > 0 && this.get("isHitListReady") === true) {
            //     this.set("isHitListReady", false);
            if (hitList.length > max) {
                singleTypes = _.reject(hitList, function (hit) {
                    if (_.contains(foundTypes, hit.type) === true || foundTypes.length === max) {
                        return true;
                    }

                    foundTypes.push(hit.type);
                });

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
        }
    });

    return SearchbarModel;
});
