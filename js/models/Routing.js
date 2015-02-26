define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'models/SearchBar'
], function (_, Backbone, EventBus, Config, Searchbar) {

    var RoutingModel = Backbone.Model.extend({
        defaults: {
            description: '',
            endDescription: '',
            routingtime: '',
            routingdate: '',
            fromCoord: '',
            toCoord: '',
            fromList: [],
            toList: [],
            startAdresse: '',
            zielAdresse: ''
        },
        initialize: function () {
            EventBus.on("winParams", this.setStatus, this), // Fenstermanagement
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
        },
        setStatus: function (args) {   // Fenstermanagement
            if (args[2] === "routing") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
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
                        if (childlayer.id && childlayer.id == 'routenplanerroute') {
                             map.removeLayer(childlayer);
                        }
                    });
                }
            });
        },
        suggestByBKG: function (value, target) {
            if (value.length < 4) {
                return;
            }
            else {
                var parts = value.split(/[.,\/ -]/);
                var plz = _.find(parts, function(val) {
                    return parseInt(val) && parseInt(val) >= 10000 && parseInt(val) <= 99999;
                });
                if (!plz) {
                    value = value + '&filter=plz:20* OR plz:21* OR plz:22*';
                }
            }
            $.ajax({
                url: locations.host + '/bkg_suggest',
                data: 'count=15&query=' + value,
                context: this,  //das Model
                async: true,
                type: "GET",
                success: function (data) {
                    try {
                        var treffer = new Array();
                        if (target == 'start') {
                            _.each(data, function (strasse, index, list) {
                                treffer.push('id="' + strasse.suggestion + '" class="list-group-item startAdresseSelected"><span>' +  strasse.highlighted + '</span>');
                            });
                            this.set('fromList', treffer);
                        }
                        else {
                            _.each(data, function (strasse, index, list) {
                                treffer.push('id="' + strasse.suggestion + '" class="list-group-item zielAdresseSelected"><span>' +  strasse.highlighted + '</span>');
                            });
                            this.set('toList', treffer);
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                },
                error: function (error) {
                    alert ('Adressabfrage fehlgeschlagen: ' + error.statusText);
                },
                timeout: 3000
            });
        },
        geosearchByBKG: function (value, target) {
            $.ajax({
                url: locations.host + '/bkg_geosearch',
                data: 'srsName=EPSG:25832&count=1&outputformat=json&query=' + value,
                context: this,  // das model
                async: true,
                type: "GET",
                success: function (data) {
                    try {
                        if (data.features[0] && data.features[0].geometry) {
                            if (target == 'start') {
                                this.set('fromCoord', data.features[0].geometry.coordinates);
                                this.set('fromList', '');
                                this.set('startAdresse', data.features[0].properties.text);
                            }
                            else {
                                this.set('toCoord', data.features[0].geometry.coordinates);
                                this.set('toList', '');
                                this.set('zielAdresse', data.features[0].properties.text);
                            }
                            if (data.features[0].properties.typ != 'Haus'){
                                this.suggestByBKG(data.features[0].properties.text, target);
                            }
                        }
                    }
                    catch (error) {
                        //console.log(error);
                    }
                },
                error: function (error) {
                    alert ('Adressabfrage fehlgeschlagen: ' + error.statusText);
                },
                timeout: 3000
            });
        },
        requestRoute: function () {
            var request = 'PROVIDERID=HHBWVI&REQUEST=VI-ROUTE&START-X=' + this.get('fromCoord')[0] + '&START-Y=' + this.get('fromCoord')[1] + '&DEST-X=' + this.get('toCoord')[0] + '&DEST-Y=' + this.get('toCoord')[1] + '&USETRAFFIC=TRUE';
            /* Erwartete Übergabeparameter:
            *  routingtime [hh:mm]
            *  routingdate [yyyy-mm-dd]
            */
            if (this.get('routingtime') != '' && this.get('routingdate')!= '') {
//                var timeoffset = (new Date().getTimezoneOffset()/60).toString().substr(0, 1) + '0' + (new Date().getTimezoneOffset()/60).toString().substr(1, 1);
                var splitter = this.get('routingtime').split(':');
                var utcHour = (parseFloat(splitter[0]) + new Date().getTimezoneOffset()/60).toString();
                var utcMinute = parseFloat(splitter[1]);
                request = request + '&STARTTIME=' + this.get('routingdate') + 'T' + utcHour + ':' + utcMinute + ':00.000Z';
            }
            $('#loader').show();
            $.ajax({
                url: locations.host + '/viom_v05',
                data: request,
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
                    vectorlayer.id = 'routenplanerroute';
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
        }
    });

    return new RoutingModel();
});
