define([
    'underscore',
    'backbone',
    'openlayers',
    'collections/WMSLayerList',
    'eventbus',
    'proj4js'
], function (_, Backbone, ol, WMSLayerList, EventBus) {

    Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";

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

            this.set('projection', new ol.proj.configureProj4jsProjection({
                code: 'EPSG:25832',
                units: 'm',
                extent: [265948.8191, 6421521.2254, 677786.3629, 7288831.7014],
                axisOrientation: 'enu', // default
                global: false,  // default
            })),
            this.set('view', new ol.View2D({
                projection: this.get('projection'),
                center: [565874, 5934140],
                extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                resolution: 26.458319045841044,
                resolutions : [ 66.14614761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105 ],
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
                
            }
            else if (tool === 'gfi') {
                this.get('map').un('click', this.setPositionCoordPopup);
                this.get('map').on('click', this.setGFIParams, this);
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
                return element.getVisible() === true;
            });
            _.each(layersVisible, function (element, index) {
                if (element.get('folder') !== 'geobasisdaten') {
                    var gfiURL = element.getSource().getGetFeatureInfoUrl(
                        coordinate, resolution, projection,
                        {'INFO_FORMAT': 'text/xml'}
                    )
    
                    gfiParams.push({
                        url: gfiURL,
                        name: element.get('name')
                    });
                }
            });
            EventBus.trigger('setGFIParams', gfiParams);
            EventBus.trigger('setGFIPopupPosition', coordinate);
        },
        setCenter: function (value) {
            this.get('map').getView().setCenter(value);
            this.get('map').getView().setZoom(7);
        }
    });

    return Map;
});