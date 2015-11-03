define([
    "backbone",
    "eventbus",
    "modules/searchbar/model"
    ], function (Backbone, EventBus) {
    "use strict";
    return Backbone.Model.extend({
        /**
        *
        */
        defaults: {
            inUse: 0,
            minChars: 3,
            gazetteerURL: "",
            searchStreets: false,
            searchHouseNumbers: false,
            searchDistricts: false,
            searchParcels: false,
            onlyOneStreetName: "",
            searchStringRegExp: "",
            houseNumbers: []
        },
        /**
         * @description Initialisierung der Gazetteer Suche
         * @param {Object} config - Das Konfigurationsobjekt für die Gazetteer-Suche.
         * @param {string} config.url - Die URL.
         * @param {boolean} [config.searchStreets=false] - Soll nach Straßennamen gesucht werden? Vorraussetzung für searchHouseNumbers. Default: false.
         * @param {boolean} [config.searchHouseNumbers=false] - Sollen auch Hausnummern gesucht werden oder nur Straßen? Default: false.
         * @param {boolean} [config.searchDistricts=false] - Soll nach Stadtteilen gesucht werden? Default: false.
         * @param {boolean} [config.searchParcels=false] - Soll nach Flurstücken gesucht werden? Default: false.
         * @param {integer} [config.minCharacters=3] - Mindestanzahl an Characters im Suchstring, bevor Suche initieert wird. Default: 3.
         * @param {string} [initialQuery] - Initialer Suchstring.
         */
        initialize: function (config, initialQuery) {
            this.set("gazetteerURL", config.url);
            if (config.searchStreets) {
                this.set("searchStreets", config.searchStreets);
            }
            if (config.searchHouseNumbers) {
                this.set("searchHouseNumbers", config.searchHouseNumbers);
            }
            if (config.searchDistricts) {
               this.set("searchDistricts", config.searchDistricts);
            }
            if (config.searchParcels) {
                this.set("searchParcels", config.searchParcels);
            }
            if (config.minChars) {
                this.set("minChars", config.minChars);
            }
            EventBus.on("searchbar:search", this.search, this);
            EventBus.on("gaz:adressSearch", this.adressSearch, this);
            if (initialQuery && _.isString(initialQuery) === true) {
                this.directSearch(initialQuery);
            }
        },
        /**
        *
        */
        search: function (searchString) {
            if (searchString.length >= this.get("minChars") && this.get("inUse") === 0) {
                if (this.get("searchStreets") === true) {
                    this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
                    this.set("onlyOneStreetName", "");
                    this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, true);
                }
                if (this.get("searchDistricts") === true) {
                    if (!_.isNull(searchString.match(/^[a-z]+$/i))) {
                        this.sendRequest("StoredQuery_ID=findeStadtteil&stadtteilname=" + searchString, this.getDistricts, true);
                    }
                }
                if (this.get("searchParcels") === true) {
                    var gemarkung, flurstuecksnummer;

                    if (!_.isNull(searchString.match(/^[0-9]{4}[\s|\/][0-9]*$/))) {
                        gemarkung = searchString.split(/[\s|\/]/)[0];
                        flurstuecksnummer = searchString.split(/[\s|\/]/)[1];
                        this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, true);
                    }
                    else if (!_.isNull(searchString.match(/^[0-9]{5,}$/))) {
                        gemarkung = searchString.slice(0, 4);
                        flurstuecksnummer = searchString.slice(4);
                        this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, true);
                    }
                }
            }
        },
        /**
        * @description Adresssuche mit Straße und Hausnummer und Zusatz. Wird nicht über die Searchbar getriggert.
        * @param {Object} adress - Adressobjekt zur Suche
        * @param {string} adress.streetname - Straßenname
        * @param {integer} adress.housenumber - Hausnummer
        * @param {string} [adress.affix] - Zusatz zur Hausnummer
        */
        adressSearch: function (adress) {
            if (adress.affix && adress.affix !== "") {
                this.sendRequest("StoredQuery_ID=AdresseMitZusatz&strassenname=" + adress.streetname + "&hausnummer=" + adress.housenumber + "&zusatz=" + adress.affix, this.getAdress, false);
            }
            else {
                this.sendRequest("StoredQuery_ID=AdresseOhneZusatz&strassenname=" + adress.streetname + "&hausnummer=" + adress.housenumber, this.getAdress, false);
            }
        },
        /**
        * @description Veränderte Suchabfolge bei initialer Suche, z.B. über Config.initialQuery
        * @param {string} searchString - Suchstring
        */
        directSearch: function (searchString) {
            if (searchString.search(",") !== -1) {
                var splitInitString = searchString.split(",");

                this.set("onlyOneStreetName", splitInitString[0]);
                this.set("searchStringRegExp", new RegExp(searchString.replace(/\,/g, ""), "i")); // Erst join dann als regulärer Ausdruck
                this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")), this.getHouseNumbers, false);
                this.searchInHouseNumbers();
            }
            else {
                this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
                this.set("onlyOneStreetName", "");
                this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, true);
            }
            EventBus.trigger("createRecommendedList");
        },
        /**
        * @description Methode zur Weiterleitung der adressSearch
        * @param {xml} data - Response
        */
        getAdress: function (data) {
            EventBus.trigger("gaz:getAdress", data);
        },
        /**
         * [getStreets description]
         * @param  {[type]} data [description]
         */
        getStreets: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinates,
                hitName;

            _.each(hits, function (hit) {
                coordinates = $(hit).find("gml\\:posList,posList")[0].textContent;
                hitName = $(hit).find("dog\\:strassenname, strassenname")[0].textContent;
                // "Hitlist-Objekte"
                EventBus.trigger("searchbar:pushHits", "hitList", {
                    name: hitName,
                    type: "Straße",
                    coordinate: coordinates,
                    glyphicon: "glyphicon-road",
                    id: hitName.replace(/ /g, "") + "Straße"
                });
            }, this);
            if (this.get("searchHouseNumbers") === true) {
                if (hits.length === 1) {
                    this.set("onlyOneStreetName", hitName);
                    this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(hitName), this.getHouseNumbers, false);
                    this.searchInHouseNumbers();
                }
                else if (hits.length === 0) {
                    this.searchInHouseNumbers();
                }
            }
            EventBus.trigger("createRecommendedList");
        },
        /**
         * [getDistricts description]
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        getDistricts: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinate,
                position,
                hitName;

            _.each(hits, function (hit) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                hitName = $(hit).find("dog\\:kreisname_normalisiert, kreisname_normalisiert")[0].textContent;
                // "Hitlist-Objekte"
                EventBus.trigger("searchbar:pushHits", "hitList", {
                    name: hitName,
                    type: "Stadtteil",
                    coordinate: coordinate,
                    glyphicon: "glyphicon-map-marker",
                    id: hitName.replace(/ /g, "") + "Stadtteil"
                });
            }, this);
            EventBus.trigger("createRecommendedList");
        },
        searchInHouseNumbers: function () {
            var address;

            _.each(this.get("houseNumbers"), function (houseNumber) {
                address = houseNumber.name.replace(/ /g, "");
                // Prüft ob der Suchstring ein Teilstring vom B-Plan ist
                if (address.search(this.get("searchStringRegExp")) !== -1) {
                    EventBus.trigger("searchbar:pushHits", "hitList", houseNumber);
                }
            }, this);
        },
        /**
         * [getHouseNumbers description]
         * @param  {[type]} data [description]
         */
        getHouseNumbers: function (data) {
            var hits = $("wfs\\:member,member", data),
                number,
                affix,
                coordinate,
                position,
                name,
                adress = {};

            this.set("houseNumbers", []);
            _.each(hits, function (hit) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                number = $(hit).find("dog\\:hausnummer,hausnummer")[0].textContent;
                if ($(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0] !== undefined) {
                    affix = $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0].textContent;
                    name = this.get("onlyOneStreetName") + " " + number + affix;
                    adress = {
                        streetname: this.get("onlyOneStreetName"),
                        housenumber: number,
                        affix: affix
                    };
                }
                else {
                    name = this.get("onlyOneStreetName") + " " + number ;
                    adress = {
                        streetname: this.get("onlyOneStreetName"),
                        housenumber: number,
                        affix: ""
                    };
                }
                // "Hitlist-Objekte"
                var obj = {
                    name: name,
                    type: "Adresse",
                    coordinate: coordinate,
                    glyphicon: "glyphicon-map-marker",
                    adress: adress,
                    id: _.uniqueId("Adresse")
                };

                this.get("houseNumbers").push(obj);
            }, this);
        },
        /**
         *
         */
        getParcel: function (data) {
            var hits = $("wfs\\:member,member", data),
                coordinate,
                position,
                geom,
                gemarkung,
                flurstueck;

            _.each(hits, function (hit) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                gemarkung = $(hit).find("dog\\:gemarkung,gemarkung")[0].textContent;
                flurstueck = $(hit).find("dog\\:flurstuecksnummer,flurstuecksnummer")[0].textContent;
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                geom = $(hit).find("gml\\:posList, posList")[0].textContent;
                // "Hitlist-Objekte"
                EventBus.trigger("searchbar:pushHits", "hitList", {
                    name: "Flurstück " + gemarkung + "/" + flurstueck,
                    type: "Parcel",
                    coordinate: coordinate,
                    glyphicon: "glyphicon-map-marker",
                    geom: "geom",
                    id: "Parcel"
                });
            }, this);
            EventBus.trigger("createRecommendedList");
        },
        /**
         * @description Führt einen HTTP-GET-Request aus.
         *
         * @param {String} data - Data to be sent to the server
         * @param {function} successFunction - A function to be called if the request succeeds
         * @param {boolean} asyncBool - asynchroner oder synchroner Request
         */
        sendRequest: function (data, successFunction, asyncBool) {
            this.set("inUse", this.get("inUse") + 1);
            $.ajax({
                url: this.get("gazetteerURL"),
                data: data,
                context: this,
                async: asyncBool,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                error: function () {
                    EventBus.trigger("alert", "Gazetteer-URL nicht erreichbar.");
                },
                complete: function () {
                    this.set("inUse", this.get("inUse") - 1);
                }
            });
        }
    });
});
