define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

    var CoordPopup = Backbone.Model.extend({
        defaultStatus: {
            coordinate: []
        },
        initialize: function () {
            EventBus.on('setPositionCoordPopup', this.setPosition, this);
            this.set('coordinate', []);
            this.set('coordOverlay', new ol.Overlay({
                element: $('#popup')
            }));
            this.set('element', this.get('coordOverlay').getElement());
        },
        destroyPopup: function () {
            this.get('element').popover('destroy');
        },
        showPopup: function () {
            this.get('element').popover('show');
        },
        setPosition: function (coordinate) {
            this.get('coordOverlay').setPosition(coordinate);
            this.set('coordinate', coordinate);
        }
    });

    return new CoordPopup();
});