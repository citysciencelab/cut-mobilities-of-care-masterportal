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
            description: '',
            endDescription: '',
            routingtime: '',
            routingdate: '',
            fromStrassenname: '',
            fromHausnummer: '',
            fromCoord: '',
            toStrassenname: '',
            toHausnummer: '',
            toCoord: '',
            searchString: "",   // der aktuelle String in der Suchmaske
            gazetteerURL: Config.searchBar.gazetteerURL(),
            proxyPrefix: Config.proxyURL + '?url='
        },
        initialize: function () {
            if (Config.orientation === true) {
                this.set('configOrientation', true);
            }
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
        },
        setMap: function (map) {
            this.set('map', map);
        },
        deleteRouteFromMap: function () {
            this.removeOverlay();
            var map = this.get('map');
            _.each(map.getLayers(), function (layer) {
                if (_.isArray(layer)) {
                    _.each(layer, function (childlayer) {
                        if (childlayer.id && childlayer.id == 'route') {
                             map.removeLayer(childlayer);
                        }
                    });
                }
            });
        },
        requestRoute: function () {
            if (locations.fhhnet) {
                var server= 'http://wscd0096/viom_v05';
            }
            else {
                var server= 'http://v05.viom-system.de/vi_route_new/vi_route.dll/hhjson';
            }
            var request = server + '?PROVIDERID=HHBWVI&REQUEST=VI-ROUTE&START-X=' + this.get('fromCoord')[0] + '&START-Y=' + this.get('fromCoord')[1] + '&DEST-X=' + this.get('toCoord')[0] + '&DEST-Y=' + this.get('toCoord')[1] + '&USETRAFFIC=TRUE';
            /* Erwartete Übergabeparameter:
            *  routingtime [hh:mm]
            *  routingdate [yyyy-mm-dd]
            */
            if (this.get('routingtime') != '' && this.get('routingdate')!= '') {
                var timeoffset = (new Date().getTimezoneOffset()/60).toString().substr(0, 1) + '0' + (new Date().getTimezoneOffset()/60).toString().substr(1, 1);
                var splitter = this.get('routingtime').split(':');
                var utcHour = (parseFloat(splitter[0]) + new Date().getTimezoneOffset()/60).toString();
                var utcMinute = parseFloat(splitter[1]);
                request = request + '&STARTTIME=' + this.get('routingdate') + ' ' + utcHour + ':' + utcMinute + ' ' + timeoffset + '00';
            }
            $('#loader').show();
            $.ajax({
                url: this.get('proxyPrefix') + encodeURIComponent(request),
                async: true,
                context: this,
                success: function (data, textStatus, jqXHR) {
                    $('#loader').hide();
                    var geoJsonFormat = new ol.format.GeoJSON();
                    var olFeature = geoJsonFormat.readFeature(data);
                    var vectorlayer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: [olFeature]
                        }),
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'blue',
                                width: 5
                            })
                        })
                    });
                    vectorlayer.id = 'route';
                    this.get('map').addLayer(vectorlayer);
                    this.set('endDescription', olFeature.get('EndDescription'));
                    this.set('description', olFeature.get('RouteDescription'));
                    EventBus.trigger('zoomToExtent', olFeature.getGeometry().getExtent());
                    this.addOverlay(olFeature);
                },
                error: function (data, textStatus, jqXHR) {
                    $('#loader').hide();
                    this.set('description', '');
                    this.set('endDescription', '');
                    alert('Fehlermeldung beim Laden der Route: \n' + data.responseText);
                }
            });
        },
        removeOverlay: function () {
            if (this.get('mhpOverlay')) {
                EventBus.trigger('removeOverlay', this.get('mhpOverlay'));
            }
        },
        addOverlay: function (olFeature) {
            var html = '<div id="routingoverlay" class="">';
            html += '<span class="glyphicon glyphicon-flag"></span>'
            html += '<span>' + olFeature.get('EndDescription').substr(olFeature.get('EndDescription').indexOf('. ') + 1) + '</span>';
            html += '</div>';
            $('#map').append(html);
            this.set('mhpOverlay', new ol.Overlay({ element: $('#routingoverlay')}));
            var position = olFeature.getGeometry().getLastCoordinate();
            this.get('mhpOverlay').setPosition([position[0] + 7, position[1] - 7]);
            EventBus.trigger('addOverlay', this.get('mhpOverlay'));
        },
        search: function (searchString, target, openList) {
            if (searchString.length < 4) {
                // resete
                if (target == 'start') {
                    this.set('fromStrassenname', '');
                    this.set('fromCoord', '');
                    this.set('fromHausnummer', '');
                    $("#input-group-start ul").empty();
                    $("#input-group-start ul").hide();
                }
                else {
                    this.set('toStrassenname', '');
                    this.set('toCoord', '');
                    this.set('toHausnummer', '');
                    $("#input-group-ziel ul").empty();
                    $("#input-group-ziel ul").hide();
                }
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
                            this.search(searchString, target, openList);

                        }
                        else {
                            if (this.get('fromHausnummer') == '') {
                                var hausnummer = searchString.substring(this.get('fromStrassenname').length).trim();
                                this.hausnummernsuche(this.get('fromStrassenname'), hausnummer, target, openList);
                            }
                            else {
                                // zurücksetzen, wenn Hausnummer tlw. gelöscht
                                var hausnummer = searchString.substring(this.get('fromStrassenname').length).trim();
                                if (hausnummer != this.get('fromHausnummer')) {
                                    this.set('fromHausnummer', '');
                                    this.search(searchString, target, openList);
                                }
                                else {
                                    $("#input-group-start ul").empty();
                                    $("#input-group-start ul").hide();
                                }
                            }
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
                            this.search(searchString, target, openList);

                        }
                        else {
                            if (this.get('toHausnummer') == '') {
                                var hausnummer = searchString.substring(this.get('toStrassenname').length).trim();
                                this.hausnummernsuche(this.get('toStrassenname'), hausnummer, target, openList);
                            }
                            else {
                                // zurücksetzen, wenn Hausnummer tlw. gelöscht
                                var hausnummer = searchString.substring(this.get('toStrassenname').length).trim();
                                if (hausnummer != this.get('toHausnummer')) {
                                    this.set('toHausnummer', '');
                                    this.search(searchString, target, openList);
                                }
                                else {
                                    $("#input-group-ziel ul").empty();
                                    $("#input-group-ziel ul").hide();
                                }
                            }
                        }
                    }
                }
            }
        },
        strassensuche: function (requestStreetName, target) {
            $.ajax({
                url: Config.proxyURL,
                data: {url: this.get("gazetteerURL") + "&StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(requestStreetName)},
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
                            if (target == 'start') {
                                this.set('fromStrassenname', streetNames[0].name);
                                this.set('fromCoord', '');
                                $('#startAdresse').val(streetNames[0].name);
                                $('#startAdresse').focus();
                            }
                            else {
                                this.set('toStrassenname', streetNames[0].name);
                                this.set('toCoord', '');
                                $('#zielAdresse').val(streetNames[0].name);
                                $('#zielAdresse').focus();
                            }
                            this.hausnummernsuche(streetNames[0].name, '', target, true);
                        }
                        else {
                            if (target == 'start') {
                                this.set('fromStrassenname', '');
                                this.set('fromCoord', '');
                                this.set('fromHausnummer', '');
                                $('#startAdresse').focus();
                                _.each(streetNames, function (strasse, index, list) {
                                    $("#input-group-start ul").append('<li id="' + strasse.name + '" class="list-group-item startAdresseSelected"><span class="glyphicon ' + strasse.glyphicon + '"></span><span>' +  strasse.name + '</span><small>' + strasse.type + '</small></li>');
                                });
                                $("#input-group-start ul").show();
                            }
                            else {
                                this.set('toStrassenname', '');
                                this.set('toCoord', '');
                                this.set('toHausnummer', '');
                                $('#zielAdresse').focus();
                                _.each(streetNames, function (strasse, index, list) {
                                    $("#input-group-ziel ul").append('<li id="' + strasse.name + '" class="list-group-item zielAdresseSelected"><span class="glyphicon ' + strasse.glyphicon + '"></span><span>' +  strasse.name + '</span><small>' + strasse.type + '</small></li>');
                                });
                                $("#input-group-ziel ul").show();
                            }
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                }
            });
        },
        hausnummernsuche: function (streetName, hausnummer, target, openList) {
            $.ajax({
                url: Config.proxyURL,
                data: {url: this.get("gazetteerURL") + "&StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(streetName)},
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
                        var houseNumber = _.find(houseNumbers, function (number) {
                            return number.name == streetName + ' ' + hausnummer;
                        });
                        if (houseNumber) {
                            if (target == 'start') {
                                this.set('fromHausnummer', houseNumber.name);
                                this.set('fromCoord', houseNumber.coordinate);
                                $('#startAdresse').val(houseNumber.name);
                                $("#input-group-start ul").empty();
                                $("#input-group-start ul").hide();
                                $('#startAdresse').focus();
                            }
                            else {
                                this.set('toHausnummer', houseNumber.name);
                                this.set('toCoord', houseNumber.coordinate);
                                $('#zielAdresse').val(houseNumber.name);
                                $("#input-group-ziel ul").empty();
                                $("#input-group-ziel ul").hide();
                                $('#zielAdresse').focus();
                            }
                        }
                        else {
                            if (target == 'start') {
                                this.set('fromHausnummer', '');
                                this.set('fromCoord', '');
                                $('#startAdresse').focus();
                            }
                            else {
                                this.set('toHausnummer', '');
                                this.set('toCoord', '');
                                $('#zielAdresse').focus();
                            }
                        }
                        if (openList === true) {
                            if (target == 'start') {
                                _.each(houseNumbers, function (housenumber, index, list) {
                                    $("#input-group-start ul").append('<li id="' + housenumber.name + '" class="list-group-item startAdresseSelected"><span class="glyphicon ' + housenumber.glyphicon + '"></span><span>' +  housenumber.name + '</span><small>' + housenumber.type + '</small></li>');
                                });
                                $("#input-group-start ul").show();
                            }
                            else {
                                _.each(houseNumbers, function (housenumber, index, list) {
                                    $("#input-group-ziel ul").append('<li id="' + housenumber.name + '" class="list-group-item zielAdresseSelected"><span class="glyphicon ' + housenumber.glyphicon + '"></span><span>' +  housenumber.name + '</span><small>' + housenumber.type + '</small></li>');
                                });
                                $("#input-group-ziel ul").show();
                            }
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
