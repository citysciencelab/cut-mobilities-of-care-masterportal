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
            EventBus.on('setOrientation', this.setPosition, this);
            this.set('coordOverlay', new ol.Overlay({
                element: $('#popup')
            }));
            this.set('element', this.get('coordOverlay').getElement());
            EventBus.trigger('addOverlay', this.get('coordOverlay'));
        },
        destroyPopup: function () {
            this.get('element').popover('destroy');
        },
        showPopup: function () {
            this.get('element').popover('show');
        },
        setOrientation: function (projection) {
            this.get('coordOverlay').setPosition(coordinate);
            this.set('coordinateUTM', coordinate);
            this.set('coordinateGeo', ol.coordinate.toStringHDMS(proj4(proj4('EPSG:25832'), proj4('EPSG:4326'), this.get('coordinateUTM'))));
        }
    });

    return new Orientation();
});
