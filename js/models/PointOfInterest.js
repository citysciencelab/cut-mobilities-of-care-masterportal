define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus'
], function (_, Backbone, ol, EventBus) {

    var PointOfInterest = Backbone.Model.extend({
        initialize: function () {
//            console.log(this);
        }
    });

    return PointOfInterest;
});
