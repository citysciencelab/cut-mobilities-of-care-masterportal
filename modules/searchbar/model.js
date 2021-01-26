const SearchbarModel = Backbone.Model.extend(/** @lends SearchbarModel.prototype */{
    defaults: {
        placeholder: "Suche",
        recommendedList: [],
        recommendedListLength: 5,
        quickHelp: false,
        searchString: "",
        hitList: [],
        isInitialSearch: true,
        isInitialRecommendedListCreated: false,
        knownInitialSearchTasks: ["gazetteer", "specialWFS", "bkg", "tree", "osm", "locationFinder", "elasticSearch"],
        activeInitialSearchTasks: [],
        // translations
        i18nextTranslate: null,
        buttonSearchTitle: "",
        buttonOpenHelpTitle: "",
        tempCounter: 0,
        sortByName: true,
        selectRandomHits: true,
        timeoutReference: null,
        showAllResultsText: ""
    },

    /**
     * @class SearchbarModel
     * @description todo
     * @extends Backbone.Model
     * @memberof Searchbar
     * @constructs
     * @property {String} placeholder="" todo
     * @property {Object[]} recommendedList=[] the list of shown (recommended) hits
     * @property {Number} recommendedListLength=5 todo
     * @property {Boolean} quickHelp=false todo
     * @property {String} searchString="" the current string in the search mask
     * @property {Object[]} hitList=[] an array of object{id, name, type} with optional values: coordinate, glyphicon, geom, adress, locationFinder, metaName, osm, marker, geometryType, interiorGeometry
     * @property {Boolean} isInitialSearch=true Flag that is set to false at the end of the initial search (ParametricURL).
     * @property {Boolean} isInitialRecommendedListCreated=false Has the recommended list already been generated after the initial search?
     * @property {String[]} knownInitialSearchTasks=["gazetteer", "specialWFS", "bkg", "tree", "osm", "locationFinder"] Search algorithms for which an initial search is possible
     * @property {Array} activeInitialSearchTasks=[] Search algorithms for which an initial search is activated
     * @property {function} i18nextTranslate=null translation function named i18nextTranslate := function(setter), set during parsing the file "config.json"
     * @property {String} buttonSearchTitle="", filled with "Suchen"- translated
     * @property {String} buttonOpenHelpTitle="", filled with "Hilfe öffnen"- translated
     * @property {String} showAllResultsText="", filled with "alle Ergebnisse anzeigen"- translated
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

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        if (typeof Radio.request("ParametricURL", "getInitString") !== "undefined") {
            // Speichere den Such-Parameter für die initiale Suche zur späteren Verwendung in der View
            this.setInitSearchString(Radio.request("ParametricURL", "getInitString"));
        }
        else {
            // Es wird keine initiale Suche durchgeführt
            this.set("isInitialSearch", false);
            this.set("isInitialRecommendedListCreated", true);
        }

        this.changeLang();
    },

    /**
     * change language - sets default values for the language.
     * If contents from config.json are translated, this is respected here by using the function "i18nextTranslate".
     * @param {String} lng the language changed to
     * @returns {Void} -
     */
    changeLang: function () {
        const setLanguage = {};

        if (typeof this.get("i18nextTranslate") === "function") {
            this.get("i18nextTranslate")(function (key, value) {
                setLanguage[key] = value;
            });
        }
        setLanguage.buttonSearchTitle = i18next.t("common:button.search");
        setLanguage.buttonOpenHelpTitle = i18next.t("common:modules.quickHelp.titleTag");
        setLanguage.showAllResultsText = i18next.t("common:modules.searchbar.showAllResults");

        this.set(setLanguage);
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
        let allDone = true;
        // Ist mindestens ein Suchalgorithmus noch als ausstehend markiert?

        this.get("activeInitialSearchTasks").forEach(taskName => {

            const status = this.get("initialSearch_" + taskName);

            if (!status) {
                allDone = false;
            }

        });

        if (allDone) {
            // Sobald alle Ergebnisse vorliegen, wird der Modus "Initiale Suche"
            // beendet und die Ergebnisliste erstmalig erzeugt.
            this.set("isInitialSearch", false);
            this.createRecommendedList("initialSearchFinished");
            this.checkInitialSearchResult(this.get("recommendedList"));
            this.set("isInitialRecommendedListCreated", true);
        }
    },

    /**
     * Creates a user message if the initialSearch has no results to inform the user.
     * @param   {Object[]} results recommendedList
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    checkInitialSearchResult: function (results) {
        if (Array.isArray(results) && !results.length) {
            Radio.trigger("Alert", "alert", {
                text: i18next.t("common:modules.searchbar.noInitialResults"),
                fadeOut: 5000
            });
        }
    },

    /**
     * Check by configuration which search algorithms are activated for initial search
     * @param {Object} config Configuration
     * @returns {void}
     */
    setInitialSearchTasks: function (config) {
        const searchTasks = this.get("knownInitialSearchTasks"),
            activeSearchTasks = [];

        // Prüfe für jeden bekannten Suchalgorithmus ob er aktiviert ist. Wenn ja markiere ihn als
        // "Ergebnis ausstehend" und füge ihn der Liste aktiver Suchalgorithmen hinzu.
        searchTasks.forEach(taskName => {
            if (config.hasOwnProperty(taskName)) {
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
        });

        this.set("activeInitialSearchTasks", activeSearchTasks);
    },

    /**
     * Setter for attribute "initSearchString".
     * @param {String} value Search string for initial search.
     * @returns {void}
     */
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
        const splitAdress = value.split(" ");
        let houseNumber,
            streetName;

        // für Copy/Paste bei Adressen
        if (splitAdress.length > 1 && splitAdress[splitAdress.length - 1].match(/\d/) && eventType === "paste") {
            houseNumber = splitAdress[splitAdress.length - 1];
            streetName = value.substr(0, value.length - houseNumber.length - 1);

            this.setEventType(eventType);
            this.set("searchString", streetName);
            Radio.trigger("Searchbar", "setPastedHouseNumber", houseNumber);
        }
        else if (value.length >= 3) {
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
        let tempArray = [...this.get(attribute)],
            valueWithNumbers;

        tempArray.push(value);

        // removes addresses without house number, if more than one exists
        if (evtType === "paste" && tempArray !== undefined && tempArray.length > 1) {
            valueWithNumbers = tempArray.filter(function (val) {
                const valueArray = val.name.split(",")[0].split(" ");

                return !isNaN(parseInt(valueArray[valueArray.length - 1], 10));
            });

            tempArray = valueWithNumbers === undefined ? tempArray : valueWithNumbers;
        }

        this.set(attribute, [].concat(...[].concat(...tempArray)));

        if (valueWithNumbers !== undefined && this.get("eventType") === "paste") {
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
        const tempArray = [...this.get(attribute)];
        let toRemove;

        if (typeof filter === "function" || typeof filter === "object") {
            toRemove = tempArray.filter(item => Object.keys(filter).every(key => item[key] === filter[key]));
            toRemove.forEach(item => {
                tempArray.splice(tempArray.indexOf(item), 1);
            });
        }
        else {
            for (let i = tempArray.length - 1; i >= 0; i--) {
                if (tempArray[i] === filter) {
                    tempArray.splice(i, 1);
                }
            }
        }
        this.set(attribute, Array.isArray(tempArray) ? tempArray.reduce((acc, val) => acc.concat(val), []) : tempArray);
    },

    /**
     * changes the filename extension of given filepath
     * @param  {String} src source string
     * @param  {String} ext file extension
     * @return {String} file extension
     */
    changeFileExtension: function (src, ext) {
        if (src === undefined) {
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
        if (s === undefined) {
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
        const max = this.get("recommendedListLength");
        let recommendedList = [],
            hitList = this.get("hitList");

        if (this.get("sortByName")) {
            hitList = Radio.request("Util", "sort", "address", hitList, "name");
        }
        this.setHitList(hitList);

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

            if (this.get("selectRandomHits")) {
                recommendedList = this.getRandomEntriesOfEachType(hitList, max);
            }
            else {
                recommendedList = hitList.slice(0, max);
            }

        }
        else {
            recommendedList = hitList;
        }

        if (this.get("sortByName")) {
            recommendedList = Radio.request("Util", "sort", "address", recommendedList, "name");
        }

        this.setRecommendedList(recommendedList);
        this.setTypeList(this.prepareTypeList(hitList));
        this.trigger("renderRecommendedList");

        if (triggeredBy === "initialSearchFinished" && hitList.length === 1) {
            Radio.trigger("ViewZoom", "hitSelected");
        }
    },

    /**
     * @param {Object[]} hitList List of all hits from searchbar.
     * @param {Number} maxLength Configured number of hits to be shown.
     * @returns {Object[]} - random Entries. mimum length is given by attribute "maxLength".
     */
    getRandomEntriesOfEachType: function (hitList, maxLength) {
        const randomEntries = [],
            max = hitList.length < maxLength ? hitList.length : maxLength;
        let foundTypes = [],
            foundTypesIterator = 0,
            counter = 0;

        hitList.every(hit => foundTypes.push(hit.type));
        foundTypes = [...new Set(foundTypes)];

        while (counter < max) {
            const foundTypesLength = foundTypes.length,
                positionOfFoundTypes = foundTypesIterator % foundTypesLength,
                type = foundTypes[positionOfFoundTypes],
                randomEntryByType = this.getRandomEntryByType(hitList, type);

            if (!randomEntries.includes(randomEntryByType)) {
                randomEntries.push(randomEntryByType);
                counter++;
            }
            foundTypesIterator++;
        }

        return randomEntries;
    },

    /**
     * Filters the hitList by type and returns an random object of the list.
     * @param {Object[]} hitList List of all hits from searchbar.
     * @param {String} type Type of search.
     * @returns {Object} - random object of hitlist by given type.
     */
    getRandomEntryByType: function (hitList, type) {
        const hitListByType = hitList.filter(hit => hit.type === type),
            randomNumber = Math.floor(Math.random() * hitListByType.length);

        return hitListByType[randomNumber];
    },

    /**
     * Sorts the hitList by type.
     * @param {Object[]} hitList Hitlist.
     * @returns {Object[]} - sorted Hits by Type
     */
    prepareTypeList: function (hitList) {
        const typeList = [],
            types = hitList.map(hit => hit.type),
            uniqueTypes = types.reduce((unique, item) => {
                return unique.includes(item) ? unique : [...unique, item];
            }, []);

        uniqueTypes.forEach(type => {
            const typeListPart = hitList.filter(hit => {
                    return hit.type === type;
                }),
                typeListObj = {
                    type: type,
                    list: typeListPart
                };

            typeList.push(typeListObj);
        });
        return typeList;
    },

    /**
     * Setter for attribute "recommendedList".
     * @param {Object[]} value recommendedList.
     * @returns {void}
     */
    setRecommendedList: function (value) {
        this.set("recommendedList", value);
    },

    /**
     * Setter for attribute "hitList".
     * @param {Object[]} value hitList.
     * @returns {void}
     */
    setHitList: function (value) {
        this.set("hitList", value);
    },

    /**
     * Setter for attribute "typeList".
     * @param {Object[]} value typeList.
     * @returns {void}
     */
    setTypeList: function (value) {
        this.set("typeList", value);
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
