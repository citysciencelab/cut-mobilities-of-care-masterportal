define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

    var CoordPopup = Backbone.Model.extend({
        initialize: function () {
            EventBus.on('setPositionCoordPopup', this.setPosition, this);
            this.set('coordOverlay', new ol.Overlay({
                element: $('#popup')
            }));
            this.set('element', this.get('coordOverlay').getElement());
            EventBus.trigger('addOver', this.get('coordOverlay'));
        },
        destroyPopup: function () {
            this.get('element').popover('destroy');
        },
        showPopup: function () {
            this.get('element').popover('show');
        },
        setPosition: function (coordinate) {
            this.get('coordOverlay').setPosition(coordinate);
            this.set('coordinateUTM', coordinate);
            this.set('coordinateGeo', ol.coordinate.toStringHDMS(ol.proj.transform(this.get('coordinateUTM'), 'EPSG:25832', 'EPSG:4326')));
        }
    });

    return new CoordPopup();
});