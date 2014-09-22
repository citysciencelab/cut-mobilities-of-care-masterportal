define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function (_, Backbone, ol, EventBus, Config) {
    var WFSStyle = Backbone.Model.extend({
        defaults: {
            subclass : 'Icon',
            // für Icon
            src : '../img/unknown.png',
            width : 10,
            height : 10,
            // für Circle
            radius : 10,
            fillcolor : [0, 153, 255, 1],
            strokecolor : [0, 0, 0, 1],
            // Für ClusterText
            clusterfont : 'Verdana',
            clusterscale : 2,
            clusteroffsetx : 0,
            clusteroffsety : 2,
            clusterfillcolor : [255, 0, 0, 1],
            clusterstrokecolor : [255, 255, 0, 1],
            clusterstrokewidth : 3
        },
        getClusterSymbol : function (anzahl) {
            if (!anzahl == '') {
                var font = this.get('clusterfont');
                var color = this.get('clustercolor');
                var scale = this.get('clusterscale');
                var offsetX = this.get('clusteroffsetx');
                var offsetY = this.get('clusteroffsety');
                var fillcolor = this.get('clusterfillcolor');
                var strokecolor = this.get('clusterstrokecolor');
                var strokewidth = this.get('clusterstrokewidth');
                var clusterText = new ol.style.Text({
                    text : anzahl.toString(),
                    offsetX : offsetX,
                    offsetY : offsetY,
                    font : font,
                    color : color,
                    scale : scale,
                    fill : new ol.style.Fill({
                        color : fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor,
                        width : strokewidth
                    })
                });
            }
            if (this.get('subclass') == 'Icon') {
                var src = this.get('src');
                var width = this.get('width');
                var height = this.get('height');
                var imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height
                });
            }
            else if (this.get('subclass') == 'Circle') {
                var radius = this.get('radius');
                var fillcolor = this.get('fillcolor');
                var strokecolor = this.get('strokecolor');
                var imagestyle = new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor
                    })
                });
            }
            else {
                consoloe.log('Subclass ' + this.get('subclass') + ' unbekannt.');
                return;
            }
            var style = [
                new ol.style.Style({
                    image: imagestyle,
                    text : clusterText,
                    zIndex: 'Infinity'
                })
            ];
            return style;
        },
        initialize: function () {
            var style = this.getClusterSymbol('');
            this.set('style', style);
        }
    });

    return WFSStyle;
});
