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
        defaults: {
            wfsList: [],
            mhpresult: '',
            mhpcoordinates: [],
            oldSelection: '',
            GFIPopupVisibility: false
        },
        initialize: function () {
            $('body').append('<div id="mousehoverpopup" class="col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5"></div>');
            this.set('mhpOverlay', new ol.Overlay({
                element: $('#mousehoverpopup')
            }));
            this.set('element', this.get('mhpOverlay').getElement());
            EventBus.on('newMouseHover', this.checkForEachFeatureAtPixel, this); // MouseHover auslösen. Trigger von mouseHoverCollection-Funktion
            EventBus.on('GFIPopupVisibility', this.GFIPopupVisibility, this); // GFIPopupStatus auslösen. Trigger in GFIPopoupView
            EventBus.on('setMap', this.checkLayersAndRegisterEvent, this); // initieren. Wird in Map.js getriggert, nachdem dort auf getMap reagiert wurde.
            EventBus.trigger('getMap', this);
        },
        GFIPopupVisibility: function (GFIPopupVisibility) {
            this.set('GFIPopupVisibility', GFIPopupVisibility);
        },
        checkLayersAndRegisterEvent: function (map) {
            // speichere Map-Zeugs für später
            this.set('resolution', map.getView().getResolution());
            this.set('dots_per_inch', map.DOTS_PER_INCH);
            // Lese Config-Optionen ein
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
            // speichere Ergebnisse in wfsList
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
            this.set('oldSelection', '');
            this.unset('mhpresult', {silent: true});
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
        * Wertet an der aktuell getriggerten Position alle Features der
        * Map aus, die über subfunction function(layer) zurückgegeben werden.
        * pFeatureArray wird so mit allen darzustellenden Features gepusht.
        * Nachdem die Selektion erstellt wurde, wird diese für initiale
        * if-Bedingung gespeichert und abschließend wird das Aufbereiten dieser
        * Selektion angestpßen.
        */
        checkForEachFeatureAtPixel: function (evt, map) {
            var pFeatureArray = new Array();
            map.forEachFeatureAtPixel(evt.pixel, function (selection, layer) {
                if (!layer || !selection) return;
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
            if (pFeatureArray.length > 0) {
                if (this.get('oldSelection') === '') {
                    this.set('oldSelection', pFeatureArray);
                    this.prepMouseHoverFeature(pFeatureArray);
                }
                else {
                    if (this.compareArrayOfObjects(pFeatureArray, this.get('oldSelection')) === false) {
                        this.destroyPopup(pFeatureArray);
                        this.set('oldSelection', pFeatureArray);
                            this.prepMouseHoverFeature(pFeatureArray);
                    }
                }
            }
            else {
                this.removeMouseHoverFeatureIfSet();
            }
        },
        compareArrayOfObjects: function (arr1, arr2) {
            if (arr1.length != arr2.length) return false;
            for (i=0; i<arr1.length; i++) {
                var obj1 = arr1[i];
                var obj2 = arr2[i];
                if (_.isEqual(obj1, obj2) === false) return false;
            }
            return true;
        },
        /**
        * Diese Funktion prüft ob mhpresult = '' und falls nicht
        * wird MouseHover destroyt
        */
        removeMouseHoverFeatureIfSet: function () {
            if (this.get('mhpresult') && this.get('mhpresult') !== '') {
                this.destroyPopup();
            }
        },
        /**
        * Dies Funktion durchsucht das übergebene pFeatureArray und extrahiert den
        * anzuzeigenden Text sowie die Popup-Koordinate und setzt
        * mhpresult. Auf mhpresult lauscht die View, die daraufhin rendert
        */
        prepMouseHoverFeature: function (pFeatureArray) {
            var wfsList = this.get('wfsList');
            var value = '';
            var coord = new Array();
            if (pFeatureArray.length > 0) {
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
                                    var delta = Math.round(this.get('resolution') * 39.37 * this.get('dots_per_inch')) * 0.002;
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
                    this.get('mhpOverlay').setPosition(coord);
                    this.set('mhpcoordinates', coord);
                    this.set('mhpresult', value);
                }
            }
        }
    });
    return new MouseHoverPopup();
});
