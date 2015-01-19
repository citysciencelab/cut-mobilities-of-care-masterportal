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
            if (this.get('version') && this.get('version') != '' && this.get('version') != 'nicht vorhanden') {
                var version = this.get('version');
            }
            else {
                var version = '1.3.0';
            }
            if (this.get('format') && this.get('format') != '' && this.get('format') != 'nicht vorhanden') {
                var format = this.get('format');
            }
            else {
                var format = 'image/png';
            }
            var params = {
                'LAYERS': this.get('layers'),
                'FORMAT': format,
                'VERSION': version
            }
            if (version === '1.1.1' || version === '1.1.0' || version === '1.0.0') {
                params = _.extend(params, {
                    "SRS": 'EPSG:25832'
                });
            }
            else {
                params = _.extend(params, {
                    "CRS": 'EPSG:25832'
                });
            }
            if (this.get('styles') && this.get('styles') != '' && this.get('styles') != 'nicht vorhanden') {
                params = _.extend(params, {
                    "STYLES": this.get('styles')
                });
            }
            if (this.get('legendURL') && this.get('legendURL') != '' && this.get('legendURL') != 'nicht vorhanden') {
                var legendURL = this.get('legendURL');
            }
            else{
                var legendURL = 'ignore';
            }
            this.set('source', new ol.source.TileWMS({
                url: this.get('url'),
                gutter: this.get('gutter'),
                params: params,
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
                gfiAttributes: this.get('gfiAttributes'),
                legendURL: this.get('legendURL')
//                gfiAttributes: this.convertGFIAttributes()
            }));
        }
    });
    return WMSLayer;
});
