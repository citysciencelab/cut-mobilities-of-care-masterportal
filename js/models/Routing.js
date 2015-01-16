define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'models/Searchbar'
], function (_, Backbone, EventBus, Config, Search) {

    var RoutingModel = Backbone.Model.extend({
        defaults: {
            routingday: '',
            routinghour: '',
            routingminute: '',
            fromAdresse: '',
            fromCoord: '',
            toAdresse: '',
            toCoord: '',

            searchString: "",   // der aktuelle String in der Suchmaske
            hitList: [],
            isOnlyOneStreet: false, // Wenn true --> Hausnummernsuche startet
            onlyOneStreetName: "",  // speichert den Namen der Straße, wenn die Straßensuche nur noch eine Treffer zurückgibt.
            gazetteerURL: Config.searchBar.gazetteerURL()
        },
        initialize: function () {
            console.log(Search);
        },
        searchStreets: function () {
            this.get("isSearchReady").set("streetSearch", false);
            var requestStreetName, streetNames = [];
            // Prüft ob der Suchstring ein Teilstring vom Straßennamen ist. Und ob zurzeit nur eine Straße vorhanden ist.
            if (this.get("isOnlyOneStreet") === true && this.get("onlyOneStreetName").search(this.get("searchString")) === -1) {
                // Damit die Straßensuche auch funktioniert wenn nach Hausnummern gesucht wird.
                requestStreetName = this.get("onlyOneStreetName");
            }
            else {
                requestStreetName = this.get("searchString");
            }
            $.ajax({
                url: this.get("gazetteerURL") + "&StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(requestStreetName),
                context: this,  // das model
                async: true,
                type: "GET",
                success: function (data) {
                    try {
                        // Firefox, IE
                        if (data.getElementsByTagName("wfs:member").length > 0) {
                            var hits = data.getElementsByTagName("wfs:member");
                            _.each(hits, function (element, index) {
                                var coord = data.getElementsByTagName("gml:posList")[index].textContent;
                                var streetName = data.getElementsByTagName("dog:strassenname")[index].textContent;
                                streetNames.push({"name": streetName, "type": "Straße", "coordinate": coord, "glyphicon": "glyphicon-road", "id": streetName.replace(/ /g, "") + "Straße"});
                            }, this);
                            this.pushHits("hitList", streetNames);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("member") !== undefined) {
                            var hits = data.getElementsByTagName("member");
                            _.each(hits, function (element, index) {
                                var coord = data.getElementsByTagName("posList")[index].textContent;
                                var streetName = data.getElementsByTagName("strassenname")[index].textContent;
                                streetNames.push({"name": streetName, "type": "Straße", "coordinate": coord, "glyphicon": "glyphicon-road", "id": streetName.replace(/ /g, "") + "Straße"});
                            }, this);
                            this.set("hitList", streetNames);
                        }
                        // Marker - wurde mehr als eine Straße gefunden
                        if (streetNames.length === 1) {
                            this.set("isOnlyOneStreet", true);
                            this.set("onlyOneStreetName", streetNames[0].name);
                            // Prüft ob der Suchstring ein Teilstring vom Straßennamen ist. Wenn nicht, dann wird die Hausnummernsuche ausgeführt.
                            var searchStringRegExp = new RegExp(this.get("searchString"), "i");
                            if (this.get("onlyOneStreetName").search(searchStringRegExp) === -1) {
                                this.searchHouseNumbers();
                            }
                        }
                        else {
                            this.set("isOnlyOneStreet", false);
                            // this.set("numberSearch", true);
                            this.get("isSearchReady").set("numberSearch", true);
                        }
                        // NOTE hier sollte man noch dran rumschrauben wenn noch mehr Suchen dazukommen (Reihenfolge, searchEnd-Parameter)?!
                        this.searchInBPlans();
                        this.searchInFeatures();
                    }
                    catch (error) {
                        //console.log(error);
                    }
                    this.get("isSearchReady").set("streetSearch", true);
                }
            });
        },
        searchHouseNumbers: function () {
            // this.set("numberSearch", false);
            this.get("isSearchReady").set("numberSearch", false);
            $.ajax({
                url: this.get("gazetteerURL") + "&StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")),
                context: this,  // das model
                async: true,
                type: "GET",
                success: function (data) {
                    var hits, number, affix, coord, houseNumbers = [];
                    try {
                        // Join den Suchstring
                        var searchStringJoin = this.get("searchString").replace(/ /g, "");
                        var searchStringRegExp = new RegExp(searchStringJoin, "i");
                        // Firefox, IE
                        if (data.getElementsByTagName("wfs:member").length > 0) {
                            hits = data.getElementsByTagName("wfs:member");
                            _.each(hits, function (element, index) {
                                number = element.getElementsByTagName("dog:hausnummer")[0].textContent;
                                coord = [parseFloat(data.getElementsByTagName("gml:pos")[index].textContent.split(" ")[0]), parseFloat(data.getElementsByTagName("gml:pos")[index].textContent.split(" ")[1])];
                                if (element.getElementsByTagName("dog:hausnummernzusatz")[0] !== undefined) {
                                    affix = element.getElementsByTagName("dog:hausnummernzusatz")[0].textContent;
                                    // Join die Adresse
                                    var addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number +affix;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": this.get("onlyOneStreetName") + " " + number + affix, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                                else {
                                    // Join die Adresse
                                    var addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": this.get("onlyOneStreetName") + " " + number, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                            }, this);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("member") !== undefined) {
                            hits = data.getElementsByTagName("member");
                            _.each(hits, function (element, index) {
                                number = element.getElementsByTagName("hausnummer")[0].textContent;
                                coord = [parseFloat(data.getElementsByTagName("pos")[index].textContent.split(" ")[0]), parseFloat(data.getElementsByTagName("pos")[index].textContent.split(" ")[1])];
                                if (element.getElementsByTagName("hausnummernzusatz")[0] !== undefined) {
                                    affix = element.getElementsByTagName("hausnummernzusatz")[0].textContent;
                                    // Join die Adresse
                                    var addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number +affix;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": this.get("onlyOneStreetName") + " " + number + affix, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                                else {
                                    // Join die Adresse
                                    var addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": this.get("onlyOneStreetName") + " " + number, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                            }, this);
                        }
                        this.pushHits("hitList", houseNumbers); // Fügt die Treffer zur hitList hinzu
                    }
                    catch (error) {
                        //console.log(error);
                    }
                    // this.set("numberSearch", true);
                    this.get("isSearchReady").set("numberSearch", true);
                }
            });
        }
    });

    return new RoutingModel();
});
