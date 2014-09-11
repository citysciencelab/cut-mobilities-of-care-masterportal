define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus'
], function (_, Backbone, ol, EventBus) {

    // Definition der Projektion EPSG:25832
    ol.proj.addProjection(new ol.proj.Projection({
        code: 'EPSG:25832',
        units: 'm',
        extent: [265948.8191, 6421521.2254, 677786.3629, 7288831.7014],
        axisOrientation: 'enu', // default
        global: false  // default
    }));
    var proj25832 = ol.proj.get('EPSG:25832');
    proj25832.setExtent([265948.8191, 6421521.2254, 677786.3629, 7288831.7014]);

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
            if (this.get('typ') === 'WMS') {
                this.set('source', new ol.source.TileWMS({
                    url: this.get('url'),
                    params: {
                        'LAYERS': this.get('layers'),
                        // NOTE Format für Layer standardmäßig auf 'image/jpeg', da nicht immer in der json vorhanden
                        'FORMAT': 'image/png',
                        'VERSION': this.get('version')
                    },
                    tileGrid: new ol.tilegrid.TileGrid({
                        resolutions : [
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
            }
            else if (this.get('typ') === 'WFS') {
                this.set('source', new ol.source.ServerVector({
                    format: new ol.format.WFS({
                        featureNS: 'http://www.deegree.org/app',
                        featureType: 'bikeandride'
                    }),
                    loader: function (extent, resolution, projection) {
                        var url = 'http://geofos/fachdaten_public/services/wfs_bwvi_opendata?service=WFS&request=GetFeature&version=1.1.0&typename=bikeandride';
                        $.ajax({
                            url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(url),
                            async: false,
                            context: this,
                            success: function (data, textStatus, jqXHR) {
                                this.addFeatures(this.readFeatures(data));
                            },
                            error: function (data, textStatus, jqXHR) {
                                console.log(textStatus);
                            }
                        });
                    },
                    projection: proj25832 //'EPSG:25832'
                }));
            }
        },
        /**
         *
         */
        setAttributionLayer: function () {
            if (this.get('typ') === 'WMS') {
                this.set('layer', new ol.layer.Tile({
                    source: this.get('source'),
                    name: this.get('name'),
                    typ: this.get('typ')
                }));
            }
            else if (this.get('typ') === 'WFS') {
                this.set('layer', new ol.layer.Vector({
                    source: this.get('source'),
                    name: this.get('name'),
                    typ: this.get('typ')
                }));
            }
        },
        /**
         *
         */
        setAttributions: function () {
            if(this.get('datasets')[0] !== undefined) {
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
                this.set({'visibility': false});
            }
            else {
                this.set({'visibility': true});
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
            this.set({'opacity': opacity});
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
                this.set({'settings': false});
            }
            else {
                this.set({'settings': true});
            }
        }
    });

    return WMSLayer;
});
