define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'config'
], function ($, _, Backbone, EventBus, Config) {

    var Searchbar = Backbone.Model.extend({
        defaults: {
            searchString: '',
            streetName: '',
            streetNames: [],
            wfsFeatures: [],
            houseNumber: '',
            houseNumbers: [],
            affix: '',
            coordinate: [],
            gazetteerURL: Config.gazetteerURL,
            WFSLayersToObserve: new Array()
        },
        initialize: function () {
            EventBus.on('LayerVisibilityChangedForSearchbar', this.controlObservalbe, this);
            this.listenTo(this, 'change:coordinate', this.zoomToCoordinate);
            EventBus.trigger('getBackboneLayer', this); //veranlasse abholen der layer für initiale Füllung
        },
        setSearchString: function (value) {
            this.set('searchString', value);
        },
        setDefaults: function () {
            this.set('houseNumber', '');
            this.set('affix', '');
            this.set('streetName', '');
            this.set('houseNumbers', []);
            this.set('coordinate', []);
        },
        /**
         *
         */
        controlObservalbe: function (changedLayer) {
            var pObserveable = this.get('WFSLayersToObserve');
            pObserveable = _.reject(pObserveable, function (element) {return element.cid == changedLayer.cid});
            if (changedLayer.get('typ') == 'WFS' && changedLayer.get('searchField') && changedLayer.get('visibility') == true){
                pObserveable.push(changedLayer);
            }
            this.set('WFSLayersToObserve', pObserveable);
        },
        checkSearchString: function (value) {
            this.setDefaults();
            var houseNumberPos, splitString = [], street = '';
            splitString = this.get('searchString').split(' ');
            houseNumberPos = splitString.length;

            // ***** Filter für die Hausnummer *****+
            _.each(splitString, function (element, index) {
                if (!isNaN(parseInt(element, 10))) {
                    houseNumberPos = index;
                    this.set('houseNumber', parseInt(element, 10));
                    // ***** Filter für den Hausnummernzusatz ***** //
                    var lastChar = element.substring(element.length - 1);
                    if (!lastChar.match(/^[+-]?[0-9]+$/)) {
                        this.set('affix', lastChar);
                    }
                }
            }, this);

            // ***** Filter für die Strasse ***** //
            _.each(splitString, function (element, index) {
                if (index < houseNumberPos) {
                    street += element;
                    if (index < houseNumberPos - 1) {
                        street += ' ';
                    }
                }
                this.set('streetName', street);
            }, this);

            // ***** Adresssuche oder AutoComplete ***** //
            if (value === 'search') {
                var coordinate = this.searchWFSFeature();
                if (coordinate.length == 2) {
                    this.set('coordinate', coordinate);
                    $('#autoCompleteBody').css("display", "none");
                }
                else if (this.get('affix') !== '') {
                    this.searchAddressWithAffix();
                }
                else if (this.get('houseNumber') !== '') {
                    this.searchAddress();
                }
                else {
                    this.searchStreets();
                }
            }
            else if (value === 'complete' && this.get('searchString').length > 2) {
                if (this.get('houseNumber') === '') {
                    this.searchWFSLayer();
                    this.searchStreets();
                    if (this.get('streetNames').length === 1 && splitString[splitString.length - 1] === '') {
                        $('#autoCompleteBody').css("display", "none");
                        this.searchHouseNumbers();
                    }
                    else if (this.get('streetNames').length === 1 || this.get('wfsFeatures').length) {
                        $('#autoCompleteBody').css("display", "block");
                    }
                    else if (this.get('streetNames').length > 1 || this.get('wfsFeatures').length > 1) {
                        $('#autoCompleteBody').css("display", "block");
                    }
                    else {
                        $('#autoCompleteBody').css("display", "none");
                    }
                }
                else {
                    $('#autoCompleteBody').css("display", "none");
                }
            }
            else if (this.get('searchString').length <= 2){
                $('#autoCompleteBody').css("display", "none");
            }
        },
        searchWFSFeature: function () {
            var coordinate = [];
            var pSearchString = this.get('searchString');
            var pObservable = this.get('WFSLayersToObserve');
            _.each(pObservable, function (element, index, list) {
                var pSearchFieldName = element.get('searchField');
                var pFeatures = element.get('source').getFeatures();
                _.each(pFeatures, function(feature, index, list) {
                    if (coordinate.length != 2) {
                        if (feature.values_.features) {
                            if (feature.values_.features[0].get(pSearchFieldName).indexOf(pSearchString) > -1 ) {
//                                console.log(feature);
                                var pExtent = feature.getGeometry().getExtent();
                                coordinate.push(pExtent[0] + (pExtent[2] - pExtent[0]));
                                coordinate.push(pExtent[1] + (pExtent[3] - pExtent[1]));
                            }
                        }
                        else {
                            if (feature.get(pSearchFieldName).indexOf(pSearchString) > -1 ) {
                                var pExtent = feature.getGeometry().getExtent();
                                coordinate.push(pExtent[0] + (pExtent[2] - pExtent[0]));
                                coordinate.push(pExtent[1] + (pExtent[3] - pExtent[1]));
                            }
                        }
                    }
                });
            });
            return coordinate;
        },
        searchWFSLayer: function () {
            var pObserveable = this.get('WFSLayersToObserve');
            var pSearchString = this.get('searchString');
            var pList = [];
            _.each(pObserveable, function (element, index, list) {
                var pSearchFieldName = element.get('searchField');
                var pFeatures = element.get('source').getFeatures();
                if (pFeatures.length == 0) {
//                    console.log('no Features');
                }
                _.each(pFeatures, function(feature, index, list) {
                    if (feature.values_.features) {
                        if (feature.values_.features[0].get(pSearchFieldName).toUpperCase().indexOf(pSearchString.toUpperCase()) > -1 ) {
                            pList.push(feature.values_.features[0].get(pSearchFieldName));
                        }
                    }
                    else {
                        if (feature.get(pSearchFieldName).toUpperCase().indexOf(pSearchString.toUpperCase()) > -1 ) {
                            pList.push(feature.get(pSearchFieldName));
                        }
                    }
                });
            });
            pList.sort();
            this.set('wfsFeatures', pList);
        },
        searchStreets: function () {
            var requestURL, streetNames = [];
            requestURL = this.get('gazetteerURL') + '&count=10&StoredQuery_ID=findeStrasse&strassenname=' + encodeURIComponent(this.get('searchString'));
            $.ajax({
                url: requestURL,
                context: this,  // das model
                async: true,
                type: 'GET',
                success: function (data) {
                    try {
                         // Firefox, IE
                        if (data.getElementsByTagName("wfs:member").length > 0) {
                            var hits = data.getElementsByTagName("wfs:member");
                            _.each(hits, function (element, index) {
                                streetNames.push(data.getElementsByTagName('dog:strassenname')[index].textContent);
                            }, this);
                            this.set('streetNames', streetNames);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("member") !== undefined) {
                            var hits = data.getElementsByTagName("member");
                            _.each(hits, function (element, index) {
                                streetNames.push(data.getElementsByTagName('strassenname')[index].textContent);
                            }, this);
                            this.set('streetNames', streetNames);
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                }
            });
        },
        searchHouseNumbers: function () {
            var requestURL, number, affix, houseNumbers = [];
            requestURL = this.get('gazetteerURL') + '&StoredQuery_ID=HausnummernZuStrasse&strassenname=' + encodeURIComponent(this.get('streetName').trim());
            $.ajax({
                url: requestURL,
                context: this,  // das model
                async: false,
                type: 'GET',
                success: function (data) {
                    try {
                        // Firefox, IE
                        if (data.getElementsByTagName("wfs:member").length > 0) {
                            var hits = data.getElementsByTagName("wfs:member");
                            _.each(hits, function (element) {
                                number = element.getElementsByTagName('dog:hausnummer')[0].textContent;
                                if (element.getElementsByTagName('dog:hausnummernzusatz')[0] !== undefined) {
                                    affix = element.getElementsByTagName('dog:hausnummernzusatz')[0].textContent;
                                    houseNumbers.push(number + affix);
                                }
                                else {
                                    houseNumbers.push(number + ' ');
                                }
                            });
                            houseNumbers = _.sortBy(houseNumbers.sort(), function (element) {
                                return element.length;
                            });
                            _.each(houseNumbers, function (element, index) {
                                houseNumbers[index] = element.trim();
                            });
                            this.set('houseNumbers', houseNumbers);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("member") !== undefined) {
                            var hits = data.getElementsByTagName("member");
                            _.each(hits, function (element) {
                                number = element.getElementsByTagName('hausnummer')[0].textContent;
                                if (element.getElementsByTagName('hausnummernzusatz')[0] !== undefined) {
                                    affix = element.getElementsByTagName('hausnummernzusatz')[0].textContent;
                                    houseNumbers.push(number + affix);
                                }
                                else {
                                    houseNumbers.push(number + ' ');
                                }
                            });
                            houseNumbers = _.sortBy(houseNumbers.sort(), function (element) {
                                return element.length;
                            });
                            _.each(houseNumbers, function (element, index) {
                                houseNumbers[index] = element.trim();
                            });
                            this.set('houseNumbers', houseNumbers);
                        }
                        if (houseNumbers.length > 1) {
                            $('#autoCompleteBody').css("display", "block");
                        }
                        else {
                            $('#autoCompleteBody').css("display", "none");
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                }
            });
        },
        searchAddress: function () {
            var requestURL, coordinate = [];
            requestURL = this.get('gazetteerURL') + '&StoredQuery_ID=AdresseOhneZusatz&strassenname=' + encodeURIComponent(this.get('streetName')) + '&hausnummer=' + encodeURIComponent(this.get('houseNumber'));
            $.ajax({
                url: requestURL,
                context: this,  // das model
                async: false,
                type: 'GET',
                success: function (data) {
                    try {
                        // Firefox, IE
                        if (data.getElementsByTagName("gml:pos").length > 0) {
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[0]));
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[1]));
                            this.set('coordinate', coordinate);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("pos") !== undefined) {
                            coordinate.push(parseFloat(data.getElementsByTagName('pos')[0].textContent.split(' ')[0]));
                            coordinate.push(parseFloat(data.getElementsByTagName('pos')[0].textContent.split(' ')[1]));
                            this.set('coordinate', coordinate);
                        }
                        $('#autoCompleteBody').css("display", "none");
                    }
                    catch (error) {
                        //console.log(error);
                    }
                }
            });
        },
        searchAddressWithAffix: function () {
            var requestURL, coordinate = [];
            requestURL = this.get('gazetteerURL') + '&StoredQuery_ID=AdresseMitZusatz&strassenname=' + encodeURIComponent(this.get('streetName')) + '&hausnummer=' + encodeURIComponent(this.get('houseNumber')) + '&zusatz=' + encodeURIComponent(this.get('affix'));
            $.ajax({
                url: requestURL,
                context: this,  // das model
                async: false,
                type: 'GET',
                success: function (data) {
                    try {
                        // Firefox, IE
                        if (data.getElementsByTagName("gml:pos").length > 0) {
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[0]));
                            coordinate.push(parseFloat(data.getElementsByTagName('gml:pos')[0].textContent.split(' ')[1]));
                            this.set('coordinate', coordinate);
                        }
                        // WebKit
                        else if (data.getElementsByTagName("pos") !== undefined) {
                            coordinate.push(parseFloat(data.getElementsByTagName('pos')[0].textContent.split(' ')[0]));
                            coordinate.push(parseFloat(data.getElementsByTagName('pos')[0].textContent.split(' ')[1]));
                            this.set('coordinate', coordinate);
                        }
                        $('#autoCompleteBody').css("display", "none");
                    }
                    catch (error) {
//                        console.log(error);
                    }
                }
            });
        },
        zoomToCoordinate: function () {
            if (this.get('coordinate').length > 0) {
                EventBus.trigger('setCenter', this.get('coordinate'));
            }
        }
    });

    return new Searchbar();
});
