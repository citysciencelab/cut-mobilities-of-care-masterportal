define([
    'jquery',
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function ($, _, Backbone, ol, EventBus, Config) {

    var MouseHoverPopup = Backbone.Model.extend({
        /**
         * The defaults hash (or function) can be used to specify
         * the default attributes for your model.
         * When creating an instance of the model,
         * any unspecified attributes will be set to their default value.
         */
        defaults: {
            mhpOverlay: new ol.Overlay({ element: $('#mousehoverpopup')}), // ol.Overlay
            wfsList: [],
            mhpresult: '',
            mhpcoordinates: [],
            mhptimeout: ''
        },
        /**
         * FEHLER: map.addInteraction() bewirkt zwar das hinzufügen der Interaction, fortan kann die map aber nicht mehr
         * verschoben werden. Weder hier noch in map.js läßt sich addInteraction() erfolgreich ausführen.
         * Weder über addInteraction noch über interactios:ol.interaction.defaults().extend([])
         * Ursache: ol.events.condition.mouseMove ist experimental. Mit ol.events.condition.click klappt es.
         */
        initialize: function () {
            this.set('element', this.get('mhpOverlay').getElement());
            EventBus.on('newMouseHover', this.newMouseHover, this); // MouseHover auslösen. Trigger von mouseHoverCollection-Funktion
            EventBus.on('setMap', this.checkLayer, this); // initieren. Wird in Map.js getriggert, nachdem dort auf initMouseHover reagiert wurde.
            EventBus.trigger('getMap', this);
        },
        checkLayer: function (map) {
            // Lese Config-Optionen ein und speichere Ergebnisse
            var wfsconfig = Config.wfsconfig;
            var wfsList = new Array();
            _.each(wfsconfig, function(element, key, list) {
                if (_.has(element, 'mouseHoverField')) {
                    wfsList.push({
                        layerId : element.layer,
                        fieldname : element.mouseHoverField
                    });
                }
            });
            // Füge zugehörige Layer der wfsList hinzu
            map.getLayers().forEach(function (layer) {
                if (layer.getProperties().typ === 'WFS') {
                    var layerId = layer.getSource().getFeatures()[0].layerId;
                    var wfslistlayer = _.find(wfsList, function(listlayer) {
                        return listlayer.layerId === layerId
                    });
                    if (wfslistlayer) {
                        wfslistlayer.layer = layer;
                    }
                }
            }, this);
            this.set('wfsList', wfsList);
            if (wfsList && wfsList.length > 0) {
                var selectMouseMove = new ol.interaction.Select({
                    condition: ol.events.condition.mouseMove
                });
                map.addInteraction(selectMouseMove);
                var mouseHoverCollection = selectMouseMove.getFeatures();
                mouseHoverCollection.on('add', function(ele) {
                    EventBus.trigger('newMouseHover', ele);
                });
            }
        },
        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.set('mhpresult', '');
            this.get('element').tooltip('destroy');
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            this.get('element').tooltip('show');
        },
        /**
        *
        */
        newMouseHover: function (elementlist) {
            if (elementlist.element.features) {
                var pFeatures = elementlist.element.features;
            }
            else if (elementlist.element.features_) {
                var pFeatures = elementlist.element.features_;
            }
            else {
                var pFeatures = elementlist.element;
            }

            // hole deren values. if !layerId -> clustered
            // if layerId -> unclustered
            var pFeatureArray = new Array;
            if (pFeatures.values && !pFeatures.layerId) {
                var pValues = pFeatures.values;
                if (pValues.features) {
                    _.each(pValues.features, function(element, index, list) {
                        pFeatureArray.push({
                            values: element.values,
                            layerId: element.layerId
                        });
                    });
                }
            }
            else if (pFeatures.values_ && !pFeatures.layerId) {
                var pValues = pFeatures.values_;
                if (pValues.features) {
                    _.each(pValues.features, function(element, index, list) {
                        pFeatureArray.push({
                            values: element.values_,
                            layerId: element.layerId
                        });
                    });
                }
            }
            else if (pFeatures.values && pFeatures.layerId) {
                pFeatureArray.push({
                    values: pFeatures.values,
                    layerId: pFeatures.layerId
                });
            }
            else if (pFeatures.values_ && pFeatures.layerId) {
                pFeatureArray.push({
                    values: pFeatures.values_,
                    layerId: pFeatures.layerId
                });
            }
            // für jedes gehoverte Feature...
            var wfsList = this.get('wfsList');
            var value = '';
            var coord = new Array(); //coord wird im Moment nicht benutzt für MouseHover
            _.each(pFeatureArray, function(element, index, list) {
                if (value != '') {
                    value = value + '</br></br>';
                }
                var listEintrag = _.find(wfsList, function (ele) {
                    return ele.layerId = element.layerId;
                });
                if (listEintrag) {
                    var mouseHoverField = listEintrag.fieldname;
                    if (mouseHoverField) {
                        if (_.has(element.values, mouseHoverField)) {
                            value = value + _.values(_.pick(element.values, mouseHoverField))[0];
                            if (coord.length == 0) {
                                coord.push(element.values.geom.getFlatCoordinates()[0]);
                                coord.push(element.values.geom.getFlatCoordinates()[1]);
                            }
                        }
                    }
                }
            }, this);
            // sicherstellen, dass neuer Wert vorhanden, bevor Tooltip erzeugt wird
            if (this.get('mhpresult') != value) {
                EventBus.trigger('addOverlay', this.get('mhpOverlay'));
                this.set('mhpresult', value);
                this.get('mhpOverlay').setPosition(coord);
                this.set('mhpcoordinates', coord);
            }
        }
    });
    return new MouseHoverPopup();
});
