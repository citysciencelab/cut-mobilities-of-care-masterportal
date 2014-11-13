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
            var zoom;
            if(this.get('distance')<500){
                zoom=7;
            }
            else if(this.get('distance')>500&&this.get('distance')<1000){
                zoom=5;
            }
            else{
                zoom=2;
            }
            console.log(this.get('distance'));
            EventBus.trigger('hidePOIModal');
            EventBus.trigger('setPOICenter', [parseInt(this.get('xCoord'),10),parseInt(this.get('yCoord'),10)], zoom);
        }

    });

    return PointOfInterest;
});
