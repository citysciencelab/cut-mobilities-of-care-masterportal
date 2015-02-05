define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

    var ScaleLine = Backbone.Model.extend({
        defaults: {
            scale: '',
            map: '',
            reflength: ''
        },
        initialize: function () {
            this.listenTo(this, 'change:map', this.setListener);
        },
        setListener: function () {
            this.get('map').getView().on('change:resolution', function () {
                this.calculateScale();
            }, this);
        },
        calculateScale: function () {
            var map = this.get('map');
            var view = map.getView(); ;
            var resolution = view.getResolution();
            var units = map.getView().getProjection().getUnits();
            var scaleval = Math.round(resolution * 39.37 * this.get('map').DOTS_PER_INCH).toString();
            if (scaleval >= 1000) {
                var scale = 'Maßstab = 1:  ' + scaleval.substring(0, scaleval.length-3) + '.' + scaleval.substring(scaleval.length - 3);
            }
            else {
                var scale = 'Maßstab = 1: ' + scaleval;
            }
            this.set('scale', scale);
            console.log(this.get('scale').toString().substr(10));
            this.set("scaleval", "1: " + scaleval);
            // reflength beziehtr sich auf 2cm lange Linie
            var reflengthval = Math.round(0.02 * scaleval);
            if (reflengthval >= 1000) {
                var reflength = (reflengthval/1000).toString() + ' km';
            }
            else {
                var reflength = reflengthval.toString() + ' m';
            }
            this.set('reflength', reflength);
        }
    });

    return new ScaleLine();
});
