define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'models/Layer',
    'models/wmslayer',
    'models/wfslayer',
], function (_, Backbone, ol, EventBus, Config, Layer, WMSLayer, WFSLayer) {

    /**
     *
     */
    var GroupLayer = Layer.extend({
        /**
         *
         */
        setAttributionLayerSource: function () {
            // Erzeuge Layers-Objekt
            var layerdefinitions = this.get('layerdefinitions');
            var layers = new ol.Collection();
            var backbonelayers = new Array();
            _.each(layerdefinitions, function (layerdefinition, index, list) {
                if (layerdefinition.dienst.typ === 'WMS') {
                    var newlayer = new WMSLayer(layerdefinition.dienst, layerdefinition.styles, layerdefinition.id, layerdefinition.name);
                }
                else if (layerdefinition.dienst.typ === 'WFS') {
                    var newlayer = new WFSLayer(layerdefinition.dienst, '', layerdefinition.id, layerdefinition.name);
                }
                // Setze Dafault-Werte für Layer, damit Einstellung des Gruppenlayers sich nicht mit Einstellung des Layers überschneidet
                newlayer.get('layer').setVisible(true);
                newlayer.visibility = true;
                newlayer.get('layer').setOpacity(1);
                newlayer.get('layer').setSaturation(1);
                layers.push(newlayer.get('layer'));
                backbonelayers.push(newlayer);
            });
            this.set('layers', layers);
            this.set('backbonelayers', backbonelayers);
        },
        setVisibility: function () {
            var visibility = this.get('visibility');
            this.get('layer').setVisible(visibility);
            //NOTE bei Gruppenlayern auch childLayer umschalten. Wichtig für Attribution
            _.each(this.get('backbonelayers'), function (bblayer) {
                bblayer.set('visibility', visibility);
            });
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Group({
                typ: this.get('typ'),
                layers: this.get('layers'),
                name: this.get('name')
            }));
            this.unset('layerdefinitions');
            this.unset('layers');
        }
    });
    return GroupLayer;
});
