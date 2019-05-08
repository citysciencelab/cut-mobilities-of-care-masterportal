const SearchbarModel = Backbone.Model.extend(/** @lends SearchbarModel.prototype */{
    defaults: {
        placeholder: "Suche",
        recommendedList: "",
        recommendedListLength: 5,
        quickHelp: false,
        searchString: "",
        hitList: [],
        minChars: "",
        isInitialSearch: true,
        isInitialRecommendedListCreated: false,
        knownInitialSearchTasks: ["gazetteer", "specialWFS", "bkg", "tree", "osm"],
        activeInitialSearchTasks: []
    },

    /**
     * @class SearchbarModel
     * @description todo
     * @extends Backbone.Model
     * @memberof Searchbar
     * @constructs
     * @property {String} placeholder="" todo
     * @property {String} recommendedList="" todo
     * @property {Number} recommendedListLength=5 todo
     * @property {Boolean} quickHelp=false todo
     * @property {String} searchString="" the current string in the search mask
     * @property {Array} hitList=[] todo
     * @property {String} minChars="" todo
     * @property {Boolean} isInitialSearch=true Flag that is set to false at the end of the initial search (ParametricURL).
     * @property {Boolean} isInitialRecommendedListCreated=false Has the recommended list already been generated after the initial search?
     * @property {String[]} knownInitialSearchTasks=["gazetteer", "specialWFS", "bkg", "tree", "osm"] Search algorithms for which an initial search is possible
     * @property {Array} activeInitialSearchTasks=[] Search algorithms for which an initial search is activated
     * @listens Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @listens Searchbar#RadioTriggerSearchbarPushHits
     * @listens Searchbar#RadioTriggerSearchbarRemoveHits
     * @listens Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @listens Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires ParametricURL#RadioRequestParametricURLGetInitString
     * @fires Searchbar#RadioTriggerSearchbarSetPastedHouseNumber
     * @fires Searchbar#RadioTriggerSearchbarSearch
     * @fires ViewZoom#RadioTriggerViewZoomHitSelected
     * @fires Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(Radio.channel("Searchbar"), {
            "createRecommendedList": this.createRecommendedList,
            "pushHits": this.pushHits,
            "removeHits": this.removeHits,
            "checkInitialSearch": this.checkInitialSearch,
            "abortSearch": this.abortSearch
        });

        if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
            // Speichere den Such-Parameter für die initiale Suche zur späteren Verwendung in der View
            this.setInitSearchString(Radio.request("ParametricURL", "getInitString"));
        }
        else {
            // Es wird keine initiale Suche durchgeführt
            this.set("isInitialSearch", false);
            this.set("isInitialRecommendedListCreated", true);
        }

    },

    /**
     * If a search algorithm terminates the search, it is no longer necessary to wait for a result for this algorithm.
     * Therefore, this search algorithm is marked as done.
     * @param {String} triggeredBy Name of the calling search algorithm
     * @returns {void} result
     */
    abortSearch: function (triggeredBy) {
        if (this.get("isInitialSearch")) {
            // Markiere Algorithmus als abgearbeitet
            this.set("initialSearch_" + triggeredBy, true);
            // Prüfe, ob es noch ausstehende Ergebnisse gibt
            this.checkInitialSearch();
        }
    },

    /**
     * Checks whether all search algorithms of the initial search have been processed.
     * @returns {void}
     */
    checkInitialSearch: function () {
        var allDone = true;

        // Ist mindestens ein Suchalgorithmus noch als ausstehend markiert?
        _.forEach(this.get("activeInitialSearchTasks"), function (taskName) {
            var status = this.get("initialSearch_" + taskName);

            if (!status) {
                allDone = false;
            }

        }, this);

        if (allDone) {
            // Sobald alle Ergebnisse vorliegen, wird der Modus "Initiale Suche"
            // beendet und die Ergebnisliste erstmalig erzeugt.
            this.set("isInitialSearch", false);
            this.createRecommendedList("initialSearchFinished");
            this.set("isInitialRecommendedListCreated", true);
        }
    },

    /**
     * Check by configuration which search algorithms are activated for initial search
     * @param {Object} config Configuration
     * @returns {void}
     */
    setInitialSearchTasks: function (config) {
        var searchTasks = this.get("knownInitialSearchTasks"),
            activeSearchTasks = [];

        // Prüfe für jeden bekannten Suchalgorithmus ob er aktiviert ist. Wenn ja markiere ihn als
        // "Ergebnis ausstehend" und füge ihn der Liste aktiver Suchalgorithmen hinzu.
        _.forEach(searchTasks, function (taskName) {
            if (_.has(config, taskName) === true) {
                if (taskName === "gazetteer") {
                    // Der Suchalgorithmus "gazetteer" ist ein Sonderfall, da er mehrere Suchen durchführen kann
                    this.set("initialSearch_gazetteer_streetsOrHouseNumbers", false);
                    activeSearchTasks.push("gazetteer_streetsOrHouseNumbers");
                    this.set("initialSearch_gazetteer_streetKeys", false);
                    activeSearchTasks.push("gazetteer_streetKeys");
                }
                else {
                    this.set("initialSearch_" + taskName, false);
                    activeSearchTasks.push(taskName);
                }
            }
        }, this);

        this.set("activeInitialSearchTasks", activeSearchTasks);
    },

    setInitSearchString: function (value) {
        this.set("initSearchString", value);
    },

    /**
    * called from view
    * @param {string} value - value from event
    * @param {string} eventType - type of the event
    * @fires Searchbar#RadioTriggerSearchbarSetPastedHouseNumber
    * @fires Searchbar#RadioTriggerSearchbarSearch
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
     * Help method to set an attribute of type Array.
     * @param  {String} attribute - todo
     * @param  {String} value - todo
     * @param  {event} evtType - todo
     * @fires ViewZoom#RadioTriggerViewZoomHitSelected
     * @return {void}
     */
    pushHits: function (attribute, value, evtType) {
        var tempArray = _.clone(this.get(attribute)),
            valueWithNumbers;

        tempArray.push(value);

        // removes addresses without house number, if more than one exists
        if (evtType === "paste" && !_.isUndefined(tempArray) && tempArray.length > 1) {
            valueWithNumbers = tempArray.filter(function (val) {
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
     * Removes all hits with the given filter
     * @param  {string} attribute object to be filtered
     * @param  {object[]} filter filter parameters
     * @return {Void} Nothing
     */
    removeHits: function (attribute, filter) {
        var toRemove, i,
            tempArray = _.clone(this.get(attribute));

        if (_.isObject(filter)) {
            toRemove = _.where(tempArray, filter);
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
     * @param  {String} src source string
     * @param  {String} ext file extension
     * @return {String} file extension
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
     * @param  {String} s todo
     * @param  {number} length todo
     * @returns {string} s todo
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

    /**
     * Generate a list with hits of the individual search algorithms.
     * @param {String} triggeredBy Calling search algorithm
     * @fires Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @fires ViewZoom#RadioTriggerViewZoomHitSelected
     * @returns {void}
     */
    createRecommendedList: function (triggeredBy) {
        var max = this.get("recommendedListLength"),
            recommendedList = [],
            hitList = this.get("hitList"),
            foundTypes = [],
            singleTypes,
            usedNumbers = [],
            randomNumber;

        // Die Funktion "createRecommendedList" wird vielfach (von jedem Suchalgorithmus) aufgerufen.
        // Im Rahmen der initialen Suche muss sichergestellt werden, dass die Ergebnisse der einzelnen
        // Algorithmen erst verarbeitet werden, wenn alle Ergebnisse vorliegen.
        if (this.get("isInitialSearch")) {
            // Markiere den aufgrufenden Suchalgorithmus als erledigt
            this.set("initialSearch_" + triggeredBy, true);
            // Stoße eine Prüfung, ob alle Suchen abgeschlossen sind, an. Hinweis: Wenn dies der Fall ist,
            // so wird "isInitialSearch" auf false gesetzt und die aktuelle Funktion erneut aufgerufen.
            Radio.trigger("Searchbar", "checkInitialSearch");
            return;
        }

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

        if (triggeredBy === "initialSearchFinished" && hitList.length === 1) {
            Radio.trigger("ViewZoom", "hitSelected");
        }
    },

    /**
     * Setter for "tempCounter"
     * @param {String} value tempCounter
     * @returns {void}
     */
    setTempCounter: function (value) {
        this.set("tempCounter", value);
    },

    /**
     * Setter for "eventType"
     * @param {String} value eventType
     * @returns {void}
     */
    setEventType: function (value) {
        this.set("eventType", value);
    },

    /**
     * Setter for "searchFieldisSelected"
     * @param {String} value searchFieldisSelected
     * @returns {void}
     */
    setSearchFieldisSelected: function (value) {
        this.set("searchFieldisSelected", value);
    },

    /**
     * Setter for "quickHelp"
     * @param {String} value quickHelp
     * @returns {void}
     */
    setQuickHelp: function (value) {
        this.set("quickHelp", value);
    },

    /**
     * Setter for "hitIsClick"
     * @param {String} value hitIsClick
     * @returns {void}
     */
    setHitIsClick: function (value) {
        this.set("hitIsClick", value);
    }
});

export default SearchbarModel;
