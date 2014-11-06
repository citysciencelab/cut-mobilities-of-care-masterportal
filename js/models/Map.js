define([
    'underscore',
    'backbone',
    'openlayers',
    'collections/LayerList',
    'models/MeasurePopup',
    'config',
    'eventbus'
], function (_, Backbone, ol, LayerList, MeasurePopup, Config, EventBus) {

    var DOTS_PER_INCH = $('#dpidiv').outerWidth(); // Hack um die Bildschirmauflösung zu bekommen
    $('#dpidiv').remove();
//    var POINTS_PER_INCH = 72; //PostScript points 1/72"  --> = dpi nicht ppi
    var MM_PER_INCHES = 25.4;

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
     * @requires LayerList
     * @classdesc hier beschreiben wir das modul
     */
    var Map = Backbone.Model.extend(
    {
        /**
         *
         */
        initialize: function () {
            EventBus.on('activateClick', this.activateClick, this);
            EventBus.on('addOverlay', this.addOverlay, this);
            EventBus.on('moveLayer', this.moveLayer, this);
            EventBus.on('setCenter', this.setCenter, this);
            EventBus.on('updatePrintPage', this.updatePrintPage, this);
            EventBus.on('initMouseHover', this.initMouseHover, this);

            this.set('projection', proj25832);

            this.set('view', new ol.View({
                projection: this.get('projection'),
                center: Config.view.center,
                extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                resolution: Config.view.resolution,
                resolutions : [ 66.14614761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105 ]
            }));

            this.set('map', new ol.Map({
                layers: LayerList.pluck('layer'),
                ol3Logo: false,	// default true
                renderer: 'canvas',	// 'dom', 'webgl' oder 'canvas'
                target: 'map',
                view: this.get('view'),
                controls: []
            }));

            // View listener
            this.get('view').on('change:resolution', function () {
                EventBus.trigger('currentMapScale', Math.round(this.getCurrentScale()));
            },this);
            this.get('view').on('change:center', function () {
                EventBus.trigger('currentMapCenter', this.get('view').getCenter());
            },this);
        },

        initMouseHover: function () {
            EventBus.trigger('checkmousehover', this.get('map'));
        },

        getCurrentScale: function () // wird in GFI Popup verwendet.
        {
            var resolution = this.get('view').getResolution();
            var units = this.get('view').getProjection().getUnits();
//            var dpi = 25.4 / 0.28;
            var dpi = DOTS_PER_INCH;
            var mpu = ol.proj.METERS_PER_UNIT[units];
            var scale = resolution * mpu * 39.37 * dpi;
            return scale;
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
         *
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
            var scale = this.getCurrentScale();
            layersVisible = _.filter(layers, function (element) {
                // NOTE GFI-Filter Nur Sichtbar
                return element.getVisible() === true;
            });
            _.each(layersVisible, function (element) {
                if (element.getProperties().typ === 'WMS' && element.get('gfiAttributes') !== false) {
                    var gfiURL = element.getSource().getGetFeatureInfoUrl(
                        coordinate, resolution, projection,
                        {'INFO_FORMAT': 'text/xml'}
                    );
                    gfiParams.push({
                        typ: 'WMS',
                        scale: scale,
                        url: gfiURL,
                        name: element.get('name'),
                        attributes: element.get('gfiAttributes')
                    });
                }
                else if (element.getProperties().typ === 'WFS') {
                    gfiParams.push({
                        typ: 'WFS',
                        scale: scale,
                        source: element.getSource(),
                        name: element.get('name'),
                        attributes: element.get('gfiAttributes')
                    });
                }
            });
            EventBus.trigger('setGFIParams', [gfiParams, coordinate]);
        },
        setCenter: function (value) {
            this.get('map').getView().setCenter(value);
            this.get('map').getView().setZoom(7);
        },
        updatePrintPage: function (active) {
            if(active === true) {
                this.get('map').on('precompose', this.handlePreCompose);
                this.get('map').on('postcompose', this.handlePostCompose, this);
            }
            else {
                this.get('map').un('precompose', this.handlePreCompose);
                this.get('map').un('postcompose', this.handlePostCompose, this);
            }
            this.get('map').render();
        },
        calculatePageBoundsPixels: function () {
            var s = $('#scaleField').val();
            var size = $('#layoutField').val().split(',');
            var width = parseInt(size[0], 10);
            var height = parseInt(size[1], 10);
            var view = this.get('map').getView();
            var resolution = view.getResolution();
            var w = width / DOTS_PER_INCH * MM_PER_INCHES / 1000.0 * s / resolution * ol.has.DEVICE_PIXEL_RATIO;
            var h = height / DOTS_PER_INCH * MM_PER_INCHES / 1000.0 * s / resolution * ol.has.DEVICE_PIXEL_RATIO;
            var mapSize = this.get('map').getSize();
            var center = [mapSize[0] * ol.has.DEVICE_PIXEL_RATIO / 2 ,
                          mapSize[1] * ol.has.DEVICE_PIXEL_RATIO / 2];
            var minx, miny, maxx, maxy;
            minx = center[0] - (w / 2);
            miny = center[1] - (h / 2);
            maxx = center[0] + (w / 2);
            maxy = center[1] + (h / 2);
            return [minx, miny, maxx, maxy];
        },
        handlePreCompose: function(evt) {
            var ctx = evt.context;
            ctx.save();
        },
        handlePostCompose: function(evt) {
            var ctx = evt.context;
            var size =  this.get('map').getSize();
            var height = size[1] * ol.has.DEVICE_PIXEL_RATIO;
            var width = size[0] * ol.has.DEVICE_PIXEL_RATIO;
            var minx, miny, maxx, maxy;
            var printPageRectangle = this.calculatePageBoundsPixels();
            minx = printPageRectangle[0], miny = printPageRectangle[1],
            maxx = printPageRectangle[2], maxy = printPageRectangle[3];
            ctx.beginPath();
            // Outside polygon, must be clockwise
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.lineTo(0, 0);
            ctx.closePath();
            // Inner polygon,must be counter-clockwise
            ctx.moveTo(minx, miny);
            ctx.lineTo(minx, maxy);
            ctx.lineTo(maxx, maxy);
            ctx.lineTo(maxx, miny);
            ctx.lineTo(minx, miny);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 5, 25, 0.55)';
            ctx.fill();
            ctx.restore();
        }
    });

    return Map;
});
