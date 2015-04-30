define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function (_, Backbone, ol, EventBus, Config) {

    var Attribution = Backbone.Model.extend({
        defaults: {
            alreadySet: false,
            attribution: ''
        },
        initialize: function () {
            this.listenTo(this, 'change:alreadySet', this.addAttributionControl);
            EventBus.on('startEventAttribution', this.startEventAttribution, this); //Beim erneuten sichtbar schalten des Layers wird die Funktion wieder ausgeführt
            EventBus.on('stopEventAttribution', this.stopEventAttribution, this); //Beim ausschalten des Layers wird die Funktion ausgeführt
            EventBus.on('setAttributionToLayer', this.checkLayer, this);
            EventBus.on('setMap', this.addAttributionControl, this);
        },
        /*
        * Diese Funktion wird für jeden Backbone-Layer ausgeführt und startet
        * die Auswertung. Die gefundenen html-Tags werden im Attribut olAttribution am Layer
        * gespeichert und vom layer an die source übernommen.
        */
        checkLayer: function (layer) {
            if (layer.get('typ') != 'GROUP'){
                var checkConfig = this.checkConfigForStringAttribution(layer);
                var checkApi = this.checkAPIforAttribution(layer);
                var layerattributions = _.reject(_.union(checkConfig, checkApi), function (arr) {
                    return arr === undefined;
                });
                if (_.isArray(layerattributions) && layerattributions.length > 0) {
                    layer.set('olAttribution', layerattributions);                    
                }
                this.checkConfigForEventAttribution(layer);
            }
        },
        /*
        * Diese Funktion triggert das der config definierte Event im
        * definierten Abstand. Damit das Event bekannt ist, muss es über die Main
        * geladen werden. Als Speicherort bietet sich eine .js im Portalverzeichnis an.
        */
        checkConfigForEventAttribution: function (layer) {            
            var config = this.returnConfig(layer);
            if (config && _.isObject(config.attribution)) {
                this.listenTo(layer, 'change:eventAttribution', function (layer) {
                    var eventAttribution = layer.get('eventAttribution');
                    if (eventAttribution) {
                        var layerattributions = layer.get('layer').getSource().getAttributions();
                        if (!layerattributions) {
                            var layerattributions = new Array();
                        }
                        else {
                            layerattributions.splice(layerattributions.length-1, 1);
                        }
                        layerattributions.push (
                            new ol.Attribution({
                                html: eventAttribution
                            })
                        );
                        layer.set('olAttribution', layerattributions);
                        // layer.get('layer').getSource().attributions_ = layerattributions;
                        layer.reload();
                    }
                });
                if (config.attribution.timeout && config.attribution.timeout > 0 && config.attribution.eventname){
                    layer.EventAttribution = {
                        name: config.attribution.eventname,
                        timeout: config.attribution.timeout
                    }
                    if (layer.visibility === true) {
                        EventBus.trigger('startEventAttribution', layer);
                    }
                }
            }
        },
        startEventAttribution: function (layer) {
            var eventname = layer.EventAttribution.name;
            var timeout = layer.EventAttribution.timeout;
            layer.EventAttribution.Event = setInterval (function() {
                if (layer.get('layer').getVisible() === true) {
                    EventBus.trigger(eventname, this, layer);
                }
            }, timeout);
            EventBus.trigger(eventname, this, layer);
        },
        stopEventAttribution: function (layer) {
            var event = layer.EventAttribution.Event;
            clearInterval(event);
            layer.EventAttribution.Event = '';
        },
        addAttributionControl: function (map) {
            if (this.get('alreadySet') === false) {
                var attribution = new ol.control.Attribution({
                    collapsible: true,
                    collapsed: false,
                    className: 'attribution', //in attribution.css
                    tipLabel: ''
                });
                EventBus.trigger('addControl', attribution);
                this.set('alreadySet', true);
                this.set('attribution', attribution);
            }            
        },
        checkAPIforAttribution: function (layer) {
            if (layer.get('layerAttribution') && layer.get('layerAttribution') != '' && layer.get('layerAttribution') != 'nicht vorhanden') {
                var attribution = layer.get('layerAttribution');
            }
            if (attribution) {
                return [
                    new ol.Attribution({
                        html: '<strong>' + layer.get('name') + ':</strong></br>' + attribution + '</br>'
                    })
                ];
            }
        },
        checkConfigForStringAttribution: function (layer) {
            var config = this.returnConfig(layer);
            if (config && _.isString(config.attribution)) {
                return [
                    new ol.Attribution({
                        html: '<strong>' + layer.get('name') + ':</strong></br>' + config.attribution + '</br>'
                    })
                ];
            }
        },
        returnConfig: function (layer) {
            var config = _.find(Config.layerIDs, function (layerdef) {
                if (layerdef.styles && layerdef.styles != '') {
                    var checkid = layerdef.id + '_' + layerdef.styles;
                }
                else {
                    var checkid = layerdef.id;
                }
                return checkid === layer.id;
            });
            if (!config) {
                // Erzege ein Array der Gruppenlayer
                var configs = _.filter(Config.layerIDs, function (layerdef) {
                    return _.isArray(layerdef.id);
                });
                var config;
                _.each(configs, function (gruppenlayer) {
                   _.each(gruppenlayer.id, function (layerdef) {
                       if (layerdef.styles && layerdef.styles != '') {
                            var checkid = layerdef.id + '_' + layerdef.styles;
                        }
                        else {
                            var checkid = layerdef.id;
                        }
                       if (layer.id === checkid) {
                           config = layerdef;
                       }
                   });
                });
            }
            if (config && config.attribution){
                return config;
            }
        }
    });

    return new Attribution();
});
