define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
], function (_, Backbone, EventBus, Config) {

    var wfsFeatureFilter = Backbone.Model.extend({
        defaults: {
            wfsList: [],
            map: {}
        },
        initialize: function () {
            EventBus.on('checkwfsfeaturefilter', this.prep, this); // initieren. Wird in Map.js getriggert, nachdem dort auf initWfsFeatureFilter reagiert wurde.
            EventBus.trigger('initWfsFeatureFilter', this);
        },
        prep: function (map) {
            // Trigger übergibt map -> abspeichern
            // view nutzt map ohne Übergabe
            if (map) {
                this.set('map', map);
            }
            var countConfig = this.readConfig();
            if (countConfig != 0) {
                this.readLayers();
            }
        },
        readConfig: function () {
            // Lese Config-Optionen ein und speichere Ergebnisse
            var layerIDs = Config.layerIDs;
            var wfsList = new Array();
            _.each(layerIDs, function(element, key, list) {
                if (_.has(element, 'filterOptions')) {
                    wfsList.push({
                        layerId : element.id,
                        filterOptions : element.filterOptions
                    });
                }
            });
            this.set('wfsList', wfsList);
            return wfsList.length;
        },
        readLayers: function () {
            var map = this.get('map');
            var wfsList = this.get('wfsList');
            map.getLayers().forEach(function(layer) {
                if (layer.getProperties() && layer.getProperties().typ === 'WFS') {
                    var layerID = layer.id;
                        if (layerID) {
                            var wfsListEntry = _.find(wfsList, function (ele) {
                                return ele.layerId == layerID
                            });
                            if (wfsListEntry) {
                                if (layer.getVisible() === true) {
                                    _.extend(wfsListEntry, {
                                        layer: layer
                                    });
                                }
                                else {
                                    var shortedList = _.reject(wfsList, function(ele) {
                                        return ele.layerId == layerID
                                    });
                                    wfsList = shortedList;
                                }
                            }
                        }
//                    }
                }
            }, this);
            this.set('wfsList', wfsList);
        }
    });

    return new wfsFeatureFilter();
});
