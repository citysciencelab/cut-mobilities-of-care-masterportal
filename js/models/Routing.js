define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'models/SearchBar'
], function (_, Backbone, EventBus, Config, Searchbar) {

    var RoutingModel = Backbone.Model.extend({
        defaults: {
            configOrientation: false,
            routingday: '',
            routinghour: '',
            routingminute: '',
            fromStrassenname: '',
            fromHausnummer: '',
            fromCoord: '',
            toAdresse: '',
            toStrassenname: '',
            toHausnummer: '',
            toCoord: '',

            searchString: "",   // der aktuelle String in der Suchmaske
            hitList: [],
            gazetteerURL: Config.searchBar.gazetteerURL()
        },
        initialize: function () {
            if (Config.orientation === true) {
                this.set('configOrientation', true);
            }
        },
        search: function (searchString, target) {
            if (searchString.length < 4) {
                // resete alles
                this.set('toStrassenname', '');
                this.set('fromStrassenname', '');
                this.set('toCoord', '');
                this.set('fromCoord', '');
                this.set('toHausnummer', '');
                this.set('fromHausnummer', '');
                $("#input-group-start ul").empty();
                $("#input-group-ziel ul").empty();
                $("#input-group-start ul").hide();
                $("#input-group-ziel ul").hide();
            }
            else {
                if (target == 'start') {
                    if (this.get('fromStrassenname') == '') {
                        this.strassensuche(searchString, target);
                    }
                    else {
                        // zurücksetzen, wenn Straßenname tlw. gelöscht
                        if (searchString.indexOf(this.get('fromStrassenname')) == -1) {
                            this.set('fromStrassenname', '');
                            this.search(searchString, target);
                        }
                        if (this.get('fromHausnummer') == '') {
                            var hausnummer = searchString.substring(this.get('fromStrassenname').length).trim();
                            if (hausnummer) {
                                this.hausnummernsuche(this.get('fromStrassenname'), hausnummer, target);
                            }
                        }
                        else {
                            // zurücksetzen, wenn Hausnummer tlw. gelöscht
                            if (searchString.indexOf(this.get('fromHausnummer')) == -1) {
                                this.set('fromHausnummer', '');
                                this.search(searchString, target);
                            }
                            //suche Zusatz
                        }
                    }
                }
                else { //target == ziel
                    if (this.get('toStrassenname') == '') {
                         this.strassensuche(searchString, target);
                    }
                    else {
                        // zurücksetzen, wenn Straßenname tlw. gelöscht
                        if (searchString.indexOf(this.get('toStrassenname')) == -1) {
                            this.set('toStrassenname', '');
                            this.search(searchString, target);
                        }
                        if (this.get('toHausnummer') == '') {
                            var hausnummer = searchString.substring(this.get('toStrassenname').length).trim();
                            if (hausnummer) {
                                this.hausnummernsuche(this.get('toStrassenname'), hausnummer, target);
                            }
                        }
                        else {
                            // zurücksetzen, wenn Hausnummer tlw. gelöscht
                            if (searchString.indexOf(this.get('toHausnummer')) == -1) {
                                this.set('toHausnummer', '');
                                this.search(searchString, target);
                            }
                            //suche Zusatz
                        }
                    }
                }
            }
        },
        strassensuche: function (requestStreetName, target) {
            $.ajax({
                url: this.get("gazetteerURL") + "&StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(requestStreetName),
                context: this,  // das model
                async: true,
                type: "GET",
                success: function (data) {
                    var streetNames = [];
                    try {
                        // Firefox, IE
                        if (data.getElementsByTagName("wfs:member").length > 0) {
                            var hits = data.getElementsByTagName("wfs:member");
                            _.each(hits, function (element, index) {
                                var coord = data.getElementsByTagName("gml:posList")[index].textContent;
                                var streetName = data.getElementsByTagName("dog:strassenname")[index].textContent;
                                streetNames.push({"name": streetName, "type": "Straße", "coordinate": coord, "glyphicon": "glyphicon-road", "id": streetName.replace(/ /g, "") + "Straße"});
                            }, this);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("member") !== undefined) {
                            var hits = data.getElementsByTagName("member");
                            _.each(hits, function (element, index) {
                                var coord = data.getElementsByTagName("posList")[index].textContent;
                                var streetName = data.getElementsByTagName("strassenname")[index].textContent;
                                streetNames.push({"name": streetName, "type": "Straße", "coordinate": coord, "glyphicon": "glyphicon-road", "id": streetName.replace(/ /g, "") + "Straße"});
                            }, this);
                        }
                        // Marker - wurde mehr als eine Straße gefunden
                        $("#input-group-start ul").empty();
                        $("#input-group-ziel ul").empty();
                        $("#input-group-start ul").hide();
                        $("#input-group-ziel ul").hide();
                        if (streetNames.length === 1 && requestStreetName == streetNames[0].name) {
                            var coordinates = streetNames[0].coordinate.split(' ');
                            var center = new Array();
                            center.push(parseFloat(coordinates[2] + (coordinates[2] - coordinates[0])));
                            center.push(parseFloat(coordinates[1] + (coordinates[5] - coordinates[1])));

                            if (target == 'start') {
                                this.set('fromStrassenname', streetNames[0].name);
                                this.set('fromCoord', center);
                                $('#startAdresse').val(streetNames[0].name);
                            }
                            else {
                                this.set('toStrassenname', streetNames[0].name);
                                this.set('toCoord', center);
                                $('#zielAdresse').val(streetNames[0].name);
                            }
                        }
                        else {
                            this.set('toStrassenname', '');
                            this.set('fromStrassenname', '');
                            this.set('toCoord', '');
                            this.set('fromCoord', '');
                            this.set('toHausnummer', '');
                            this.set('fromHausnummer', '');
                            _.each(streetNames, function (strasse, index, list) {
                                if (target == 'start') {
                                    $("#input-group-start ul").append('<li id="' + strasse.name + '" class="list-group-item startAdresseSelected"><span class="glyphicon ' + strasse.glyphicon + '"></span><span>' +  strasse.name + '</span><small>' + strasse.type + '</small></li>');
                                    $("#input-group-start ul").show();
                                }
                                else {
                                    $("#input-group-ziel ul").append('<li id="' + strasse.name + '" class="list-group-item zielAdresseSelected"><span class="glyphicon ' + strasse.glyphicon + '"></span><span>' +  strasse.name + '</span><small>' + strasse.type + '</small></li>');
                                    $("#input-group-ziel ul").show();
                                }
                            });
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                }
            });
        },
        hausnummernsuche: function (streetName, hausnummer, target) {
            $.ajax({
                url: this.get("gazetteerURL") + "&StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(streetName),
                context: this,  // das model
                async: true,
                type: "GET",
                success: function (data) {
                    var hits, number, affix, coord, houseNumbers = [];
                    try {
                        // Join den Suchstring
                        var searchStringJoin = (streetName + hausnummer).replace(/ /g, "");
                        var searchStringRegExp = new RegExp(searchStringJoin, "i");
                        // Firefox, IE
                        if (data.getElementsByTagName("wfs:member").length > 0) {
                            hits = data.getElementsByTagName("wfs:member");
                            _.each(hits, function (element, index) {
                                number = element.getElementsByTagName("dog:hausnummer")[0].textContent.trim();
                                coord = [parseFloat(data.getElementsByTagName("gml:pos")[index].textContent.split(" ")[0]), parseFloat(data.getElementsByTagName("gml:pos")[index].textContent.split(" ")[1])];
                                if (element.getElementsByTagName("dog:hausnummernzusatz")[0] !== undefined) {
                                    affix = element.getElementsByTagName("dog:hausnummernzusatz")[0].textContent;
                                    // Join die Adresse
                                    var addressJoin = streetName.replace(/ /g, "") + number +affix;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": streetName + " " + number + affix, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                                else {
                                    // Join die Adresse
                                    var addressJoin = streetName.replace(/ /g, "") + number;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": streetName + " " + number, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                            }, this);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("member") !== undefined) {
                            hits = data.getElementsByTagName("member");
                            _.each(hits, function (element, index) {
                                number = element.getElementsByTagName("hausnummer")[0].textContent.trim();
                                coord = [parseFloat(data.getElementsByTagName("pos")[index].textContent.split(" ")[0]), parseFloat(data.getElementsByTagName("pos")[index].textContent.split(" ")[1])];
                                if (element.getElementsByTagName("hausnummernzusatz")[0] !== undefined) {
                                    affix = element.getElementsByTagName("hausnummernzusatz")[0].textContent;
                                    // Join die Adresse
                                    var addressJoin = streetName.replace(/ /g, "") + number +affix;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": streetName + " " + number + affix, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                                else {
                                    // Join die Adresse
                                    var addressJoin = streetName.replace(/ /g, "") + number;
                                    // Prüft ob der Suchstring ein Teilstring der Adresse ist
                                    if (addressJoin.search(searchStringRegExp) !== -1) {
                                        houseNumbers.push({"name": streetName + " " + number, "type": "Adresse", "coordinate": coord, "glyphicon": "glyphicon-map-marker", "id": addressJoin + "Adresse"});
                                    }
                                }
                            }, this);
                        }
                        // Marker - wurde mehr als eine Straße gefunden
                        $("#input-group-start ul").empty();
                        $("#input-group-ziel ul").empty();
                        $("#input-group-start ul").hide();
                        $("#input-group-ziel ul").hide();
                        if (houseNumbers.length === 1 && houseNumbers[0].id === streetName + hausnummer + 'Adresse') {
                            console.log(housenumber.id);
                            if (target == 'start') {
                                this.set('fromHausnummer', houseNumbers[0].name);
                                this.set('fromCoord', houseNumbers[0].coordinate);
                                $('#startAdresse').val(houseNumbers[0].name);
                            }
                            else {
                                this.set('toHausnummer', houseNumbers[0].name);
                                this.set('toCoord', houseNumbers[0].coordinate);
                                $('#zielAdresse').val(houseNumbers[0].name);
                            }
                        }
                        else {
                            if (target == 'start') {
                                this.set('fromHausnummer', '');
                                this.set('fromCoord', '');
                            }
                            else {
                                this.set('toHausnummer', '');
                                this.set('toCoord', '');
                            }
                            _.each(houseNumbers, function (housenumber, index, list) {
                                console.log(housenumber.id);
                                if (target == 'start') {
                                    $("#input-group-start ul").append('<li id="' + housenumber.id + '" class="list-group-item startAdresseSelected"><span class="glyphicon ' + housenumber.glyphicon + '"></span><span>' +  housenumber.name + '</span><small>' + housenumber.type + '</small></li>');
                                    $("#input-group-start ul").show();
                                }
                                else {
                                    $("#input-group-ziel ul").append('<li id="' + housenumber.id + '" class="list-group-item zielAdresseSelected"><span class="glyphicon ' + housenumber.glyphicon + '"></span><span>' +  housenumber.name + '</span><small>' + housenumber.type + '</small></li>');
                                    $("#input-group-ziel ul").show();
                                }
                            });
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                }
            });
        }
    });

    return new RoutingModel();
});
