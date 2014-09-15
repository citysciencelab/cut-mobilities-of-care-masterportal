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
    var WFSLayer = Backbone.Model.extend({

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
            var getrequest = this.get('url')
                + '?REQUEST=GetFeature'
                + '&SERVICE=WFS';
            if (this.get('featureType') && this.get('featureType') != '') {
                getrequest += '&TYPENAME=' + this.get('featureType');
            }
            if (this.get('version') && this.get('version') != '') {
                getrequest += '&VERSION=' + this.get('version');
            }
            if (this.get('outputFormat') && this.get('outputFormat') != '') {
                getrequest += '&OUTPUTFORMAT=' + this.get('outputFormat');
            }
            if (this.get('srsname') && this.get('srsname') != '') {
                getrequest += '&SRSNAME=' + this.get('srsname');
            }
            this.set('source', new ol.source.ServerVector({
                format: new ol.format.WFS({
                    featureNS: this.get('featureNS'),
                    featureType: this.get('featureType')
                }),
                loader: function (extent, resolution, projection) {
                    $.ajax({
                        url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(getrequest),
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
                extractStyles: false,
                /* experimental in OL3
                strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
                    maxZoom: 19
                })),*/
                projection: proj25832 //'EPSG:25832'
            }));
            this.set('style', [new ol.style.Style({
                /*image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({
                        color: [0, 153, 255, 1]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [0, 0, 0, 1]
                    })
                }),*/
                image: new ol.style.Icon({
                    src: '../img/unknown.png',
                    width: 10,
                    height: 10
                }),
                zIndex: 'Infinity'
            })]);
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Vector({
                source: this.get('source'),
                name: this.get('name'),
                typ: this.get('typ'),
                style: this.get('style')
            }));
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

    return WFSLayer;
});
