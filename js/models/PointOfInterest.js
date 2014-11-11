define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus'
], function (_, Backbone, ol, EventBus) {

    var PointOfInterest = Backbone.Model.extend({
        initialize: function () {
//            console.log(this);
        },
        setCenter: function(){
            EventBus.trigger('hidePOIModal');
            EventBus.trigger('setCenter', [parseInt(this.get('xCoord'),10),parseInt(this.get('yCoord'),10)]);
        }

    });

    return PointOfInterest;
});
