define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function (_, Backbone, ol, EventBus, Config) {

    //lade relativ von requirejs baseurl
    var baseUrl = require.toUrl('').split('?')[0];

    var WFSStyle = Backbone.Model.extend({
        defaults: {
            imagepath : baseUrl + '../img/',
            subclass : 'Icon',
            // für Icon
            imagename : 'unknown.png',
            imagewidth : 1,
            imageheight : 1,
            imagescale : 1,
            imageoffsetx: 0,
            imageoffsety: 0,
            // für Circle
            circleradius : 10,
            circlefillcolor : [0, 153, 255, 1],
            circlestrokecolor : [0, 0, 0, 1],
            // für Stroke
            strokecolor : [150, 150, 150, 1],
            strokewidth : 5,
            // Für IconWithText
            textlabel : 'default',
            textfont : 'Courier',
            textscale : 1,
            textoffsetx : 0,
            textoffsety : 0,
            textfillcolor : [255, 255, 255, 1],
            textstrokecolor : [0, 0, 0, 1],
            textstrokewidth : 3,
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
        /*
        * Fügt dem normalen Symbol ein Symbol für das Cluster hinzu und gibt evtl. den Cache zurück
        */
        getClusterStyle : function (feature) {
            var mycoll = new ol.Collection(feature.get('features'));
            var size = mycoll.getLength();
            var style = this.get('styleCache')[size];
            if (!style) {
                if (size != '1') {
                    style = this.getClusterSymbol(size);
                }
                else {
                    style = this.getSimpleStyle();
                }
                this.get('styleCache')[size] = style;
            }
            return style;
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
                var style = this.getSimpleStyle();
                style.push(
                new ol.style.Style({
                    text: clusterText,
                    zIndex: 'Infinity'
                }));
                return style;
            }
        },
        getCustomLabeledStyle : function (label) {
            this.set('textlabel', label);
            var style = this.getSimpleStyle();
            return style;
        },
        getSimpleStyle : function () {
            if (this.get('subclass') == 'Icon') {
                var src = this.get('imagepath') + this.get('imagename');
                var width = this.get('imagewidth');
                var height = this.get('imageheight');
                var scale = parseFloat(this.get('imagescale'));
                var offset = [parseFloat(this.get('imageoffsetx')), parseFloat(this.get('imageoffsety'))];
                var imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,                    
//                    anchorXUnits: 'pixels',
//                    anchorYUnits: 'pixels'
                });
            }
            else if (this.get('subclass') == 'IconWithText') {
                var src = this.get('imagepath') + this.get('imagename');
                var width = this.get('imagewidth');
                var height = this.get('imageheight');
                var scale = parseFloat(this.get('imagescale'));
                var imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale
                });
                var font = this.get('textfont').toString();
                var text = this.get('textlabel');
                var color = this.returnColor(this.get('textcolor'));
                var scale = parseInt(this.get('textscale'));
                var offsetX = parseInt(this.get('textoffsetx'));
                var offsetY = parseInt(this.get('textoffsety'));
                var fillcolor = this.returnColor(this.get('textfillcolor'));
                var strokecolor = this.returnColor(this.get('textstrokecolor'));
                var strokewidth = parseInt(this.get('textstrokewidth'));
                var symbolText = new ol.style.Text({
                    text : text,
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
            else if (this.get('subclass') == 'Circle') {
                var radius = parseInt(this.get('circleradius'));
                var fillcolor = this.returnColor(this.get('circlefillcolor'));
                var strokecolor = this.returnColor(this.get('circlestrokecolor'));
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
            else if (this.get('subclass') == 'Stroke') {
                var strokecolor = this.returnColor(this.get('strokecolor'));
                var strokewidth = parseInt(this.get('strokewidth'));
                var strokestyle = new ol.style.Stroke({
                    color: strokecolor,
                    width: strokewidth
                });
            }
            else {
                // console.log('Subclass ' + this.get('subclass') + ' unbekannt.');
                return;
            }
            var style = [
                new ol.style.Style({
                    image: imagestyle,
                    text : symbolText,
                    zIndex: 'Infinity',
                    stroke: strokestyle
                })
            ];
            return style;
        },
        initialize: function () {
            var style = this.getSimpleStyle();
            this.set('style', style);
            var styleCache = new Array();
            this.set('styleCache', styleCache);
        }
    });
    return WFSStyle;
});
