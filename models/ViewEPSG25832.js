/*global define*/
define([
    'underscore',
    'backbone',
    'openlayers',
    'proj4js'
], function (_, Backbone, ol) {

    var projection = new ol.proj.configureProj4jsProjection({
        code: 'EPSG:25832',
        units: 'm',
        extent: [265948.8191, 6421521.2254, 677786.3629, 7288831.7014],
        axisOrientation: 'enu', // default
        global: false,  // default
    });
    
    var ViewEPGS25832 = Backbone.Model.extend({
        view: new ol.View2D({
            projection: projection,
            center: [565874, 5934140],
            extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
            resolution: 26.458319045841044,
            resolutions : [ 66.14614761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105 ],
            //resolutions: [ 66.1458333333333, 26.458333333333, 15.875, 10.583333333333, 5.2916666666666, 2.64583333333333, 1.32291666666667, 0.661458333333333, 0.264583333333333 ]
        })
    });

    return ViewEPGS25832;
});