define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'models/Layer'
], function (_, Backbone, ol, EventBus, Config, Layer) {

    /**
     *
     */
    var WMSLayer = Layer.extend({
        /**
         *
         */
        setAttributionLayerSource: function () {
            this.set('source', new ol.source.TileWMS({
                url: this.get('url'),
                params: {
                    'LAYERS': this.get('layers'),
                    // NOTE Format für Layer standardmäßig auf 'image/png', da nicht immer in der json vorhanden
                    'FORMAT': 'image/png',
                    'VERSION': this.get('version')
//                    'SLD' : 'http://wscd0096/master_sd/xml/filterSLD.xml'
                },
                tileGrid: new ol.tilegrid.TileGrid({
                    resolutions: [
                        66.14614761460263,
                        26.458319045841044,
                        15.874991427504629,
                        10.583327618336419,
                        5.2916638091682096,
                        2.6458319045841048,
                        1.3229159522920524,
                        0.6614579761460262,
                        0.2645831904584105
                    ],
                    origin: [
                        442800,
                        5809000
                    ]
                })
            }));
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Tile({
                source: this.get('source'),
                name: this.get('name'),
                typ: this.get('typ'),
                gfiAttributes: this.get('gfiAttributes')
            }));
        }
    });
    return WMSLayer;
});
