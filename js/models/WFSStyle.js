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
            imagesrc : '../img/unknown.png',
            imagewidth : 10,
            imageheight : 10,
            // für Circle
            radius : 10,
            fillcolor : [0, 153, 255, 1],
            strokecolor : [0, 0, 0, 1],
            // Für ClusterText
            clusterfont : 'Courier',
            clusterscale : 1,
            clusteroffsetx : 0,
            clusteroffsety : 0,
            clusterfillcolor : [255, 255, 255, 1],
            clusterstrokecolor : [0, 0, 0, 1],
            clusterstrokewidth : 3
        },
        returnColor: function (textstring) {
            if (typeof textstring == 'string') {
                var pArray = new Array();
                pArray = textstring.replace('[', '').replace(']', '').replace(/ /g, '').split(',');
                return [pArray[0], pArray[1], pArray[2], pArray[3]];
            }
            else {
                return textstring;
            }
        },
        getClusterSymbol : function (anzahl) {
            if (!anzahl == '') {
                var font = this.get('clusterfont').toString();
                var color = this.returnColor(this.get('clustercolor'));
                var scale = parseInt(this.get('clusterscale'));
                var offsetX = parseInt(this.get('clusteroffsetx'));
                var offsetY = parseInt(this.get('clusteroffsety'));
                var fillcolor = this.returnColor(this.get('clusterfillcolor'));
                var strokecolor = this.returnColor(this.get('clusterstrokecolor'));
                var strokewidth = parseInt(this.get('clusterstrokewidth'));
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
                console.log(clusterText);
            }
            if (this.get('subclass') == 'Icon') {
                var src = this.get('imagesrc');
                var width = this.get('imagewidth');
                var height = this.get('imageheight');
                var imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height
                });
            }
            else if (this.get('subclass') == 'Circle') {
                var radius = this.get('radius');
                var fillcolor = this.returnColor(this.get('fillcolor'));
                var strokecolor = this.returnColor(this.get('strokecolor'));
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
