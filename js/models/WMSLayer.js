define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus'
], function (_, Backbone, ol, EventBus) {

    /**
     *
     */
    var WMSLayer = Backbone.Model.extend({

        /**
         *
         */
        initialize: function () {
            this.listenTo(this, 'change:visibility', this.setVisibility);
            this.listenTo(this, 'change:transparence', this.updateOpacity);

            // NOTE in 'setAttributionLayerSource()' und 'setAttributionLayer()' wird zwischen WMS und WFS differenziert
            this.setAttributionLayerSource();
            this.setAttributionLayer();

            // TODO standardmäßig alle Layer sichtbar --> über config steuern
            this.set('visibility', true);
            this.get('layer').setVisible(this.get('visibility'));
            this.set('settings', false);
            this.set('transparence', 0);

            // NOTE hier werden die datasets[0] Attribute aus der json in das Model geschrieben
            this.setAttributions();
            this.unset('datasets');
        },
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
                typ: this.get('typ')
            }));
        },
        /**
         *
         */
        setAttributions: function () {
            if (this.get('datasets')[0] !== undefined) {
                var dataset = this.get('datasets')[0];
                this.set('metaID', dataset.md_id);
                this.set('metaName', dataset.md_name);
                this.set('kategorieOpendata', dataset.kategorie_opendata);
            }
        },
        /**
         *
         */
        toggleVisibility: function () {
            if (this.get('visibility') === true) {
                this.set({
                    'visibility': false
                });
            } else {
                this.set({
                    'visibility': true
                });
            }
            EventBus.trigger('checkVisibilityByFolder');
        },
        /**
         *
         */
        setUpTransparence: function (value) {
            if (this.get('transparence') < 100) {
                this.set('transparence', this.get('transparence') + value);
            }
        },
        /**
         *
         */
        setDownTransparence: function (value) {
            if (this.get('transparence') > 0) {
                this.set('transparence', this.get('transparence') - value);
            }
        },
        /**
         *
         */
        updateOpacity: function () {
            var opacity = (100 - this.get('transparence')) / 100;
            this.get('layer').setOpacity(opacity);
            this.set({
                'opacity': opacity
            });
        },
        /**
         *
         */
        setVisibility: function () {
            this.get('layer').setVisible(this.get('visibility'));
        },
        /**
         *
         */
        toggleSettings: function () {
            if (this.get('settings') === true) {
                this.set({
                    'settings': false
                });
            } else {
                this.set({
                    'settings': true
                });
            }
        }
    });

    return WMSLayer;
});
