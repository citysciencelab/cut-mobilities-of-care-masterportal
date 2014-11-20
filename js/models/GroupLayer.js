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
            _.each(layerdefinitions, function (layerdefinition, index, list) {

                if (layerdefinition.dienst.typ === 'WMS') {
                    var newlayer = new WMSLayer(layerdefinition.dienst);
                }
                else if (layerdefinition.dienst.typ === 'WFS') {
                    var newlayer = new WFSLayer(layerdefinition.dienst);
                }
                // Setze Dafault-Werte für Layer, damit Einstellung des Gruppenlayers sich nicht mit Einstellung des Layers überschneidet
                newlayer.get('layer').setVisible(true);
                newlayer.get('layer').setOpacity(1);
                newlayer.get('layer').setSaturation(1);

                layers.push(newlayer.get('layer'));
            });
            this.set('layers', layers);

            //Setze Layernamen, falls nicht übergeben
            if (!this.get('name') || this.get('name') == '') {
                var name = this.get('layers')[0].getProperties().name;
                this.set('name', name);
            }
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
