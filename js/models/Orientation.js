define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers',
    'proj4'
], function (_, Backbone, EventBus, ol, proj4) {

    proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

    var Orientation = Backbone.Model.extend({
        initialize: function () {
            EventBus.on('setOrientation', this.setOrientation, this);
        },
        setOrientation: function () {
            // Geolocation marker
            proj4326=ol.proj.get('EPSG:4326');
            var positions = new ol.geom.LineString([],
                /** @type {ol.geom.GeometryLayout} */ ('XYZM'));

            // Geolocation Control
            var geolocation = new ol.Geolocation(/** @type {olx.GeolocationOptions} */ ({
              projection: proj4326,
              tracking: true
            }));
            var deltaMean = 500; // the geolocation sampling period mean in ms

            // Listen to position changes
            var position
            geolocation.on('change', function(evt) {
              position = geolocation.getPosition();
              var accuracy = geolocation.getAccuracy();
              var heading = geolocation.getHeading() || 0;
              var speed = geolocation.getSpeed() || 0;
              var m = Date.now();

              var newCenter = proj4(proj4('EPSG:4326'), proj4('EPSG:25832'), position);
              var marker = document.getElementById('geolocation_marker');
              //marker.style.visibility='visible';
              //marker.appendChild(document.getElementById('geolocation_marker'));
              var marker= new ol.Overlay({
                  position:newCenter,
                  positioning: 'center-center',
                  element: marker,
                  stopEvent: false

              });
            EventBus.trigger('addOverlay', marker);

              var coords = positions.getCoordinates();
              var len = coords.length;
              if (len >= 2) {
                deltaMean = (coords[len - 1][3] - coords[0][3]) / (len - 1);
              }
            //Infobox
            /*var html = [
                'Position: ' + position[0].toFixed(2) + ', ' + position[1].toFixed(2),
                'Accuracy: ' + accuracy,
                'Heading: ' + Math.round(radToDeg(heading)) + '&deg;',
                'Speed: ' + (speed * 3.6).toFixed(1) + ' km/h',
                'Delta: ' + Math.round(deltaMean) + 'ms'
              ].join('<br />');
              document.getElementById('info').innerHTML = html;*/
             geolocation.setTracking(false);
                EventBus.trigger('setCenter', newCenter);
            });
            // convert radians to degrees
            function radToDeg(rad) {
              return rad * 360 / (Math.PI * 2);
            }
            // convert degrees to radians
            function degToRad(deg) {
              return deg * Math.PI * 2 / 360;
            }
            // modulo for negative values
            function mod(n) {
              return ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            }

           geolocation.on('error', function() {
              alert('Standpunktbestimmung momentan nicht verfügbar!');
            });
        }
    });

    return new Orientation();
});
