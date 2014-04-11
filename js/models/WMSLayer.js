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
                //tileGrid: new ol.tilegrid.TileGrid({
                //    //resolutions : [ 66.14234614761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105 ],
                //    resolutions : [ 66.14614761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105 ],
                //    origin: [0, 0],
                //    tileSize : 256
                //})
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