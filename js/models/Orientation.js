define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers',
    'proj4',
    'collections/stylelist'
], function (_, Backbone, EventBus, ol, proj4, StyleList) {

    proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

    var Orientation = Backbone.Model.extend({
        defaults: {
            'marker' :  new ol.Overlay({positioning: 'center-center', stopEvent: false}),
            'newCenter' : ''
        },
        initialize: function () {
            EventBus.on('setOrientation', this.setOrientation, this);
            EventBus.on('getPOI', this.getPOI, this);
            EventBus.on('sendVisibleWFSLayerPOI', this.getPOIParams, this);
        },
        setOrientation: function (btn) {
            var geolocation = new ol.Geolocation({tracking: true, projection: ol.proj.get('EPSG:4326')});
            geolocation.on('change', function(evt) {
                var position = geolocation.getPosition();
                this.set('newCenter',proj4(proj4('EPSG:4326'), proj4('EPSG:25832'), position));
                EventBus.trigger('setCenter', this.get('newCenter'), 6);
                EventBus.trigger('setGeolocation', [this.get('newCenter'), position]);
                var marker = this.get('marker');
                marker.setElement(document.getElementById('geolocation_marker'));
                marker.setPosition(this.get('newCenter'));
                this.set('marker', marker);
                EventBus.trigger('addOverlay', marker);
                geolocation.setTracking(false);
                if (btn=="poi"){
                    this.getPOI(500);
                }
                EventBus.trigger('showGeolocationMarker', this);
            },this);
            geolocation.on('error', function(err) {
                alert('Standpunktbestimmung momentan nicht verfügbar!');
                $(function () {
                    $('#loader').hide();
                });
                EventBus.trigger('setGeolocation', err);
                EventBus.trigger('clearGeolocationMarker', this);
            });
        },
        getPOI: function(distance){
            this.set('distance', distance);
            var circle=new ol.geom.Circle(this.get('newCenter'), this.get('distance'));
            var circleExtent=circle.getExtent();
            var circleCoord = circle.getCenter();
            this.set('circleExtent', circleExtent);
            EventBus.trigger('getVisibleWFSLayerPOI', this);
        },
        getPOIParams: function(visibleWFSLayers){
            var featureArray = [];
            _.each(visibleWFSLayers, function (layer) {
                layer.get('source').forEachFeatureInExtent(this.get('circleExtent'), function (feature) {
                    //featureArray.push(feature);
                    EventBus.trigger('setModel', feature, StyleList, this.get('distance'), this.get('newCenter'),layer);
                }, this);
            }, this);
            EventBus.trigger('showPOIModal');
        }
    });

    return new Orientation();
});
