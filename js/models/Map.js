define([
    'underscore',
    'backbone',
    'openlayers',
    'collections/WMSLayerList',
    'models/MeasurePopup',
    'eventbus'
], function (_, Backbone, ol, WMSLayerList, MeasurePopup, EventBus) {

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
     * @exports Map
     * @requires WMSLayerList
     * @classdesc hier beschreiben wir das modul
     */
    var Map = Backbone.Model.extend(
    {
        /** A property of the module.*/
        defaults: {
            zur: ''
        },
        /**
         * A property of the module.
         * @param {String} id The id of get data for.
         * @return {String} The data.
         */
        initialize: function () {
            EventBus.on('activateClick', this.activateClick, this);
            EventBus.on('addOverlay', this.addOverlay, this);
            EventBus.on('moveLayer', this.moveLayer, this);
            EventBus.on('setCenter', this.setCenter, this);

            this.set('projection', proj25832);

            this.set('view', new ol.View({
                projection: this.get('projection'),
                center: [565874, 5934140],
                extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                resolution: 26.458319045841044,
                resolutions : [ 66.14614761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105 ]
            }));
            
            this.set('map',  new ol.Map({
                layers: WMSLayerList.pluck('layer'),
                ol3Logo: false,	// default true
                renderer: 'canvas',	// 'dom', 'webgl' oder 'canvas'
                target: 'map',
                view: this.get('view'),
                controls: []
            }));
        },
        activateClick: function (tool) {
            if (tool === 'coords') {
                this.get('map').un('click', this.setGFIParams, this);
                this.get('map').on('click', this.setPositionCoordPopup);
                this.get('map').removeLayer(MeasurePopup.get('layer'));
                this.get('map').removeInteraction(MeasurePopup.get('draw'));
                $('#measurePopup').html('');
            }
            else if (tool === 'gfi') {
                this.get('map').un('click', this.setPositionCoordPopup);
                this.get('map').on('click', this.setGFIParams, this);
                this.get('map').removeLayer(MeasurePopup.get('layer'));
                this.get('map').removeInteraction(MeasurePopup.get('draw'));
                $('#measurePopup').html('');
            }
            else if (tool === 'measure') {
                this.get('map').un('click', this.setPositionCoordPopup);
                this.get('map').un('click', this.setGFIParams, this);
                this.get('map').addLayer(MeasurePopup.get('layer'));
                this.get('map').addInteraction(MeasurePopup.get('draw'));
            }
        },
        /**
         */
        addOverlay: function (overlay) {
            this.get('map').addOverlay(overlay);
        },
        /**
         */
        moveLayer: function (args) {
            var layers, index, layersCollection;
            layers = this.get('map').getLayers().getArray();
            index = layers.indexOf(args[1]);
            layersCollection = this.get('map').getLayers();
            layersCollection.removeAt(index);
            layersCollection.insertAt(index + args[0], args[1]);
        },
        /**
         * was macht den diese schöne methode
         * @param {String} id The id of get data for.
         * @return {String} The data.
         */
        setPositionCoordPopup: function (evt) {
            EventBus.trigger('setPositionCoordPopup', evt.coordinate);
        },
        setGFIParams: function (evt) {
            var layersVisible, gfiParams = [], resolution, projection, layers, coordinate;
            coordinate = evt.coordinate;
            layers = this.get('map').getLayers().getArray();
            resolution = this.get('view').getResolution();
            projection = this.get('view').getProjection();
            layersVisible = _.filter(layers, function (element) {
                // NOTE GFI-Filter Nur WMS und Sichtbar
                return element.getVisible() === true && element.getProperties().typ === 'WMS';
            });
            _.each(layersVisible, function (element) {
                var gfiURL = element.getSource().getGetFeatureInfoUrl(
                    coordinate, resolution, projection,
                    {'INFO_FORMAT': 'text/xml'}
                );
                gfiParams.push({
                    url: gfiURL,
                    name: element.get('name')
                });
            });
            EventBus.trigger('setGFIParams', [gfiParams, coordinate]);
        },
        setCenter: function (value) {
            this.get('map').getView().setCenter(value);
            this.get('map').getView().setZoom(7);
        }
    });

    return Map;
});
