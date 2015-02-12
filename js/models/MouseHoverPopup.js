define([
    'jquery',
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'models/map'
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
            mhptimeout: '',
            oldSelection: '',
            newSelection: '',
            GFIPopupVisibility: false
        },
        initialize: function () {
            this.set('element', this.get('mhpOverlay').getElement());
            EventBus.on('newMouseHover', this.newMouseHover, this); // MouseHover auslösen. Trigger von mouseHoverCollection-Funktion
            EventBus.on('GFIPopupVisibility', this.GFIPopupVisibility, this); // GFIPopupStatus auslösen. Trigger in GFIPopoupView
            EventBus.on('setMap', this.setMap, this); // initieren. Wird in Map.js getriggert, nachdem dort auf initMouseHover reagiert wurde.
            EventBus.trigger('getMap', this);
            this.checkLayer();
        },
        GFIPopupVisibility: function (GFIPopupVisibility) {
            this.set('GFIPopupVisibility', GFIPopupVisibility);
        },
        setMap: function (map) {
            this.set('map', map);
        },
        checkLayer: function () {
            var map = this.get('map');
            // Lese Config-Optionen ein und speichere Ergebnisse
            var layerIDs = Config.layerIDs;
            var wfsList = new Array();
            _.each(layerIDs, function(element, key, list) {
                if (_.has(element, 'mouseHoverField')) {
                    wfsList.push({
                        layerId : element.id,
                        fieldname : element.mouseHoverField
                    });
                }
            });
            // Füge zugehörige Layer der wfsList hinzu
            map.getLayers().forEach(function (layer) {
                if (layer.getProperties().typ === 'WFS') {
                    var layerId = layer.id;
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
                map.on('pointermove', function(evt) {
                    if (this.get('GFIPopupVisibility') === false) {
                        EventBus.trigger('newMouseHover', evt, map);
                    }
                }, this);
                /**
                 * FEHLER: map.addInteraction() bewirkt zwar das hinzufügen der Interaction, fortan kann die map aber nicht mehr
                 * verschoben werden. Weder hier noch in map.js läßt sich addInteraction() erfolgreich ausführen.
                 * Weder über addInteraction noch über interactios:ol.interaction.defaults().extend([])
                 * Ursache: ol.events.condition.mouseMove ist experimental. Mit ol.events.condition.click klappt es.
                 * Bug #2666
                 */
                /*var selectMouseMove = new ol.interaction.Select({
                    condition: ol.events.condition.mouseMove
                });
                map.getInteractions().forEach(function(interaction){
                    console.log(interaction);
                }, this);
                map.addInteraction(selectMouseMove);
                var mouseHoverCollection = selectMouseMove.getFeatures();
                mouseHoverCollection.on('add', function(ele) {
                    EventBus.trigger('newMouseHover', ele);
                });*/
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
        * forEachFeatureAtPixel greift nur bei sichtbaren Features.
        * wenn 2. Parameter (layer) == null, dann kein Layer
        */
        newMouseHover: function (evt, map) {
            var pFeatureArray = new Array();
            map.forEachFeatureAtPixel(evt.pixel, function (selection, layer) {
                oldSelection = this.get('oldSelection');
                if (layer && oldSelection != selection) {
                    var selProps = selection.getProperties();
                    if (selProps.features) {
                        var list = selProps.features;
                        _.each(list, function (element, index, list) {
                            pFeatureArray.push({
                                attributes: element.getProperties(),
                                layerId: layer.id
                            });
                        });
                    }
                    else {
                        pFeatureArray.push({
                            attributes: selProps,
                            layerId: layer.id
                        });
                    }
                }
            }, this, function (layer) {
                var wfsList = this.get('wfsList');
                if (wfsList) {
                    var found = _.find(wfsList, function(layerlist) {
                        return layerlist.layerId == layer.id;
                    });
                    if (found) {
                        return layer;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            }, this);
            var wfsList = this.get('wfsList');
            var value = '';
            var coord = new Array();
            if (pFeatureArray.length > 0) {
                this.set('newSelection', pFeatureArray);
                // für jedes gehoverte Feature...
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
                            if (_.has(element.attributes, mouseHoverField)) {
                                value = value + _.values(_.pick(element.attributes, mouseHoverField))[0];
                                if (coord.length == 0) {
                                    var resolution = this.get('map').getView().getResolution();
                                    var delta = Math.round(resolution * 39.37 * this.get('map').DOTS_PER_INCH) * 0.002;
                                    if (element.attributes.geom) {
                                        coord.push(element.attributes.geom.getFirstCoordinate()[0] + delta);
                                        coord.push(element.attributes.geom.getFirstCoordinate()[1] - delta);
                                    }
                                    else if (element.attributes.the_geom) {
                                        coord.push(element.attributes.the_geom.getFirstCoordinate()[0] + delta);
                                        coord.push(element.attributes.the_geom.getFirstCoordinate()[1] - delta);
                                    }
                                    else {
                                        console.error('Unbekanntes Geometrieformat');
                                    }
                                }
                            }
                        }
                    }
                }, this);
                if (value != '') {
                    this.set('mhpresult', value);
                    this.get('mhpOverlay').setPosition(coord);
                    this.set('mhpcoordinates', coord);
                }
            }
        }
    });
    return new MouseHoverPopup();
});
