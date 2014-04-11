/*global define*/
define([
    'underscore',
    'backbone',
    'openlayers',
    'collections/WMSLayerList',
    'proj4js'
], function (_, Backbone, ol, WMSLayerList) {

    Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";

    /**
     * @exports MAP
     * @requires WMSLayerList
     * @classdesc hier beschreiben wir das modul
     */
    var MAP = Backbone.Model.extend(
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
                //resolutions: [ 66.1458333333333, 26.458333333333, 15.875, 10.583333333333, 5.2916666666666, 2.64583333333333, 1.32291666666667, 0.661458333333333, 0.264583333333333 ]
            }));
            this.set('map',  new ol.Map({
                layers: WMSLayerList.pluck('layer'),
                ol3Logo: false,	// default true
                renderer: 'canvas',	// 'dom', 'webgl' oder 'canvas'
                target: 'map',
                view: this.get('view'),
                controls: []
            }));
            this.get('map').on('click', this.something, this);
        },
        something: function (evt) {
            console.log($('#tools'));
            console.log(evt);
        },
        /**
         * was macht den diese schöne methode
         * @param {String} id The id of get data for.
         * @return {String} The data.
         */
        test: function () {
        }
    });

    return MAP;
});