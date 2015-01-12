define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function (_, Backbone, ol, EventBus, Config) {

    var Attribution = Backbone.Model.extend({
        defaults: {
            counter: 0,
            alreadySet: false
        },
        initialize: function () {
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
            EventBus.on('returnBackboneLayerForAttribution', this.checkLayer, this);
            EventBus.on('startEventAttribution', this.startEventAttribution, this); //Beim erneuten sichtbar schalten des Layers wird die Funktion wieder ausgeführt
            EventBus.on('stopEventAttribution', this.stopEventAttribution, this); //Beim ausschalten des Layers wird die Funktion ausgeführt
        },
        setMap: function (map) {
            this.set('map', map);
            EventBus.trigger('getBackboneLayerForAttribution', this);
        },
        /*
        * Diese Funktion wird für jeden Backbone-Layer ausgeführt und startet
        * die Auswertung
        */
        checkLayer: function (layer) {
            //die childlayer des Gruppenlayer kommen extra rein
            if (layer.get('typ') != 'GROUP'){
                var checkConfig = this.checkConfigForStringAttribution(layer);
                var checkApi = this.checkAPIforAttribution(layer);
                var layerattributions = _.reject(_.union(checkConfig, checkApi), function (arr) {
                    return arr === undefined;
                });
                if (_.isArray(layerattributions) && layerattributions.length > 0) {
                    layer.get('layer').getSource().setAttributions(layerattributions);
                    if (this.get('alreadySet') == false) {
                        this.addAttributionControl();
                    }
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
                this.listenTo(layer, 'change:eventValue', function (layer) {
                    var eventValue = layer.get('eventValue');
                    if (eventValue) {
                        var layerattributions = layer.get('layer').getSource().getAttributions();
                        if (!layerattributions) {
                            var layerattributions = new Array();
                        }
                        else {
                            layerattributions.splice(layerattributions.length-1, 1);
                        }
                        layerattributions.push (
                            new ol.Attribution({
                                html: eventValue
                            })
                        );
                        layer.get('layer').getSource().setAttributions(layerattributions);
                        layer.reload();
                    }
                });
                if (this.get('alreadySet') == false) {
                    this.addAttributionControl();
                }
                if (config.attribution.timeout && config.attribution.timeout > 0 && config.attribution.eventname){
                    layer.EventAttribution = {
                        name: config.attribution.eventname,
                        timeout: config.attribution.timeout
                    }
                    if (layer.get('layer').getVisible() === true) {
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
        addAttributionControl: function () {
            var attribution = new ol.control.Attribution({
                collapsible: true,
                collapsed: false,
                className: 'attribution', //in attribution.css
                tipLabel: 'Hinweise'
            });
            this.get('map').addControl(attribution);
            this.set('attribution', attribution);
            this.set('alreadySet', true);
        },
        checkAPIforAttribution: function (layer) {
            if (layer.get('layerAttribution') && layer.get('layerAttribution') != '' && layer.get('layerAttribution') != 'nicht vorhanden') {
                var attribution = layer.get('layerAttribution');
            }
            if (attribution) {
                return [
                    new ol.Attribution({
                        html: attribution
                    })
                ];
            }
        },
        checkConfigForStringAttribution: function (layer) {
            var config = this.returnConfig(layer);
            if (config && _.isString(config.attribution)) {
                return [
                    new ol.Attribution({
                        html: config.attribution
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
