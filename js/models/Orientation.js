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
        initialize: function () {
            EventBus.on('setOrientation', this.setOrientation, this);
            EventBus.on('getPOI', this.getPOI, this);
            EventBus.on('sendVisibleWFSLayer', this.getPOIParams, this);
        },
        setOrientation: function (btn) {
            proj4326=ol.proj.get('EPSG:4326');
            var geolocation = new ol.Geolocation(/** @type {olx.GeolocationOptions} */ ({
              projection: proj4326,
              tracking: true
            }));
            var position;
            geolocation.on('change', function(evt) {
              position = geolocation.getPosition();
              this.set('newCenter',proj4(proj4('EPSG:4326'), proj4('EPSG:25832'), position));
              EventBus.trigger('setCenter', this.get('newCenter'));
              var marker = document.getElementById('geolocation_marker');
              var marker= new ol.Overlay({
                  position:this.get('newCenter'),
                  positioning: 'center-center',
                  element: marker,
                  stopEvent: false
              });
            EventBus.trigger('addOverlay', marker);
            geolocation.setTracking(false);
            if (btn=="poi"){
                this.getPOI(500);
            }
            },this);
           geolocation.on('error', function() {
              alert('Standpunktbestimmung momentan nicht verfügbar!');
            });
        },
        getPOI: function(distance){
            this.set('distance', distance);
            var circle=new ol.geom.Circle(this.get('newCenter'), this.get('distance'));
            var circleExtent=circle.getExtent();
            var circleCoord = circle.getCenter();
            this.set('circleExtent', circleExtent);
            EventBus.trigger('getVisibleWFSLayer', this);
        },
        getPOIParams: function(visibleWFSLayers){
            var featureArray = [];
            _.each(visibleWFSLayers, function (layer) {
                layer.get('source').forEachFeatureInExtent(this.get('circleExtent'), function (feature) {
                    featureArray.push(feature);
                    EventBus.trigger('setModel', feature, StyleList, this.get('distance'), this.get('newCenter'));
                }, this);
            }, this);
            EventBus.trigger('showPOIModal');
        }
    });

    return new Orientation();
});
