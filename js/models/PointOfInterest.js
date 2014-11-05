define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers',
    'proj4'
], function (_, Backbone, EventBus, ol, proj4) {

    proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

    var PointOfInterest = Backbone.Model.extend({
        initialize: function () {
            EventBus.on('setPointOfInterest', this.setPointOfInterest, this);
        },
        setPointOfInterest: function () {
           alert();
        }
    });

    return new PointOfInterest();
});
