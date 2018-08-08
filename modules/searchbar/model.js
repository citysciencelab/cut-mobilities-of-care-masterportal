define(function (require) {
    var Config = require("config"),
        $ = require("jquery"),
        SearchbarModel;

    SearchbarModel = Backbone.Model.extend({
        defaults: {
            placeholder: "Suche",
            recommendedList: "",
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

            // für Copy/Paste bei Adressen
            if (splitAdress.length > 1 && splitAdress[splitAdress.length - 1].match(/\d/) && eventType === "paste") {
                houseNumber = splitAdress[splitAdress.length - 1];
                streetName = value.substr(0, value.length - houseNumber.length - 1);

                this.setEventType(eventType);
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
         * @param  {[type]} evtType     [description]
         * @return {[type]}         [description]
         */
        pushHits: function (attribute, value, evtType) {
            var tempArray = _.clone(this.get(attribute)),
                valueWithNumbers;

            tempArray.push(value);

            // removes addresses without house number, if more than one exists
            if (evtType === "paste" && !_.isUndefined(tempArray) && tempArray.length > 1) {
                valueWithNumbers = _.filter(tempArray, function (val) {
                    var valueArray = val.name.split(",")[0].split(" ");

                    return !_.isNaN(parseInt(valueArray[valueArray.length - 1], 10));
                });

                tempArray = _.isUndefined(valueWithNumbers) ? tempArray : valueWithNumbers;
            }

            this.set(attribute, _.flatten(tempArray));

            if (!_.isUndefined(valueWithNumbers) && this.get("eventType") === "paste") {
                Radio.trigger("ViewZoom", "hitSelected");
            }
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

            if (hitList.length > max) {
                singleTypes = _.reject(hitList, function (hit) {
                    var res;

                    if (_.contains(foundTypes, hit.type) === true || foundTypes.length === max) {
                        res = true;
                    }
                    else {
                        foundTypes.push(hit.type);
                    }
                    return res;
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
            this.trigger("renderRecommendedList");
        },

        setTempCounter: function (value) {
            this.set("tempCounter", value);
        },

        setEventType: function (value) {
            this.set("eventType", value);
        }
    });

    return SearchbarModel;
});
