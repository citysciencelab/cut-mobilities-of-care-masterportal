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
        * geladen werden. Als Speicherort bietet sich eine .js im Prtalverzeichnis an.
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
                        if (this.get('alreadySet') == false) {
                            this.addAttributionControl();
                        }

                    }
                });
                if (config.attribution.timeout && config.attribution.timeout > 0){
                    setInterval(function() {
                        if (layer.get('layer').getVisible() === true) {
                            EventBus.trigger(config.attribution.eventname, this, layer);
                        }
                    }, config.attribution.timeout);
                }
                EventBus.trigger(config.attribution.eventname, this);
            }
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
