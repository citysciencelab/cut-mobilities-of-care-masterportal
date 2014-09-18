define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function (_, Backbone, ol, EventBus, Config) {
    var WFSStyle = Backbone.Model.extend({
        defaults: {
            src : '../img/unknown.png',
            width : 10,
            height : 10,
            subclass : 'Icon',
            radius : 10,
            fillcolor : [0, 153, 255, 1],
            strokecolor : [0, 0, 0, 1]
        },
        initialize: function () {
            if (this.get('subclass') == 'Icon') {
                var src = this.get('src');
                var width = this.get('width');
                var height = this.get('height');
                var style = [
                    new ol.style.Style({
                        image: new ol.style.Icon({
                        src: src,
                        width: width,
                        height: height
                    }),
                    zIndex: 'Infinity'
                    })
                ];
            }
            else if (this.get('subclass') == 'Circle') {
                var radius = this.get('radius');
                var fillcolor = this.get('fillcolor');
                var strokecolor = this.get('strokecolor');
                var style = [
                    new ol.style.Style({
                        image: new ol.style.Circle({
                        radius: radius,
                        fill: new ol.style.Fill({
                            color: fillcolor
                        }),
                        stroke: new ol.style.Stroke({
                            color: strokecolor
                        })
                    }),
                    zIndex: 'Infinity'
                    })
                ];
            }
            else {
                var style = null;
                consoloe.log('Subclass ' + this.get('subclass') + ' unbekannt.');
            }
            this.set('style', style);
        }
    });

    return WFSStyle;
});
