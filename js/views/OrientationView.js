define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Orientation.html',
    'models/Orientation',
    'config',
    'eventbus'
], function ($, _, Backbone, OrientationTemplate, Orientation,Config, EventBus) {

    var OrientationView = Backbone.View.extend({
//        model: Orientation,
        id:'toggleDiv',
        template: _.template(OrientationTemplate),
        events: {
            'click .buttonStandpunkt': 'getOrientation',
            'click .buttonPOI': 'getPOI'
        },
        initialize: function () {
            if (!navigator.geolocation) {
                return;
            }
            else {
                var that = this;
                navigator.geolocation.getCurrentPosition(function(position) {
                    that.finalize();
                }, function (error) {
//                    alert ('Standortbestimmung nicht verfügbar: ' + error.message);
                    return;
                });
            }
        },
        finalize: function () {
            EventBus.on('showGeolocationMarker', this.showGeolocationMarker, this);
            EventBus.on('clearGeolocationMarker', this.clearGeolocationMarker, this);
            this.model = Orientation;
            this.render();
        },
        showGeolocationMarker: function () {
            $('#geolocation_marker').addClass('glyphicon glyphicon-map-marker geolocation_marker');
        },
        clearGeolocationMarker: function () {
            $('#geolocation_marker').removeClass('geolocation_marker glyphicon glyphicon-map-marker');
        },
        render: function () {
            //var attr = this.model.toJSON();
            //this.getOrientation();
            //$('#toggleRow').append(this.$el.html(this.template(attr)));
            var attr=Config;
            $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        getOrientation: function (){
            this.model.setOrientation("stdPkt");
        },
        getPOI: function (){
            $(function () {
                $('#loader').show();
            });
            this.model.setOrientation("poi");
        }
    });

    return OrientationView;
});
