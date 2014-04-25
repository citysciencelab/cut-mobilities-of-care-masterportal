define([
    'underscore',
    'backbone',
    'openlayers',
    'collections/WMSLayerList',
    'eventbus',
    'models/CoordPopup',
    'views/CoordPopupView',
    'proj4js'
], function (_, Backbone, ol, WMSLayerList, EventBus, CoordPopup, CoordPopupView) {

    Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";

    /**
     * @exports Map
     * @requires WMSLayerList
     * @classdesc hier beschreiben wir das modul
     */
    var Map = Backbone.Model.extend(
    {
        /** A property of the module.*/
        default: {
            zur: ''
        },
        /**
         * A property of the module.
         * @param {String} id The id of get data for.
         * @return {String} The data.
         */
        initialize: function () {
            EventBus.on('activateClick', this.activateClick, this);

            var test = new CoordPopupView();
            this.set('coordOverlay', test.model.get('coordOverlay'));
            //this.set('coordOverlay', CoordPopup.get('coordOverlay'));
            
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
                controls: [this.get('coordOverlay')]
            }));
        },
        activateClick: function (evt) {
            if (evt === 'coords') {
                this.get('map').on('click', function (evt) {
                    EventBus.trigger('createPopup', evt);
                });
            }
        },
        /**
         * was macht den diese schöne methode
         * @param {String} id The id of get data for.
         * @return {String} The data.
         */
        test: function (evt) {
        }
    });

    return Map;
});