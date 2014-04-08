/*global define*/
define([
    'underscore',
    'backbone',
    'openlayers'
], function (_, Backbone, ol) {

    var WMSLayer = Backbone.Model.extend({
        defaults: {
            id: '',
            name: '',
            url: '',
            format: '',
            visibility: '',
            version: '',
            source: '',
            layer: ''
        },
        initialize: function () {
            this.set('source', new ol.source.TileWMS({
                url: this.get('url'),
                params: {
                    'LAYERS': this.get('title'),
                    'FORMAT': this.get('format'),
                    'VERSION': this.get('version'),
                }
            }));
            this.set('layer', new ol.layer.Tile({
                source: this.get('source')
            }));
            this.get('layer').setVisible(this.get('visibility'));
        },
        toggleVisibility: function () {
            if (this.get('visibility') === true)
            {
                this.set({'visibility': false});
                this.get('layer').setVisible(false);
            }
            else
            {
                this.set({'visibility': true});
                this.get('layer').setVisible(true);
            }
        },
        updateOpacity: function (opacity) {
            var transparence = (100 - opacity) / 100;
            this.get('layer').setOpacity(transparence);
            this.set({'opacity': transparence});
        }
    });

    return WMSLayer;
});