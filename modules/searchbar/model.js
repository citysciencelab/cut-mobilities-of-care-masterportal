const SearchbarModel = Backbone.Model.extend({
    defaults: {
        placeholder: "Suche",
        recommendedList: "",
        recommendedListLength: 5,
        quickHelp: false,
        searchString: "", // der aktuelle String in der Suchmaske
        hitList: [],
        minChars: "",
        isInitialSearch: true, // Flag das nach Ende der initialen Suche (ParametricURL) auf false gesetzt wird
        isInitialRecommendedListCreated: false, // Wurde die Ergebnisliste nach der initialen Suche bereits erzeugt?
        knownInitialSearchTasks: ["gazetteer", "specialWFS", "bkg", "tree", "osm"], // Suchalgorithmen, für die eine initiale Suche möglich ist
        activeInitialSearchTasks: [] // Suchalgorithmen, für die eine initiale Suche aktiviert ist
        // isHitListReady: true
    },

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
     * Bricht ein Suchalgorithmus die Suche ab, so muss für diesen nicht mehr auf ein Ergebnis gewartet werden.
     * Daher wird dieser Suchalgoritghmus als erledigt markiert.
     *
     * @param {String} triggeredBy Name des aufrufenden Suchalgorithmus
     * @returns {Void} Kein Rückgabewert
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
     * Prüft ob alle Suchalgorithmen der initialen Suche abgearbeitet wurden
     * @returns {Void} Kein Rückgabewert
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
     * Prüfe anhand der Konfiguration welche Suchalgorithmen zur initialen Suche aktiviert sind
     * @param {Object} config Konfiguration
     * @returns {Void} Keine Rückgabe
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
     * Removes all hits with the given filter
     * @param  {[type]} attribute Name of the object to be filtered
     * @param  {[type]} filter Filter parameters
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

    /**
     * Erzeuge eine Liste mit Treffern der einzelnen Suchalgorithmen.
     * @param {String} triggeredBy Aufrufender Suchalgorithmus
     * @returns {Void} Kein Rückgabewert
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
    },

    setTempCounter: function (value) {
        this.set("tempCounter", value);
    },

    setEventType: function (value) {
        this.set("eventType", value);
    },

    setSearchFieldisSelected: function (value) {
        this.set("searchFieldisSelected", value);
    },

    setQuickHelp: function (value) {
        this.set("quickHelp", value);
    }
});

export default SearchbarModel;
