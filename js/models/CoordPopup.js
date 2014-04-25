define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

    var CoordPopup = Backbone.Model.extend({
        initialize: function () {
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
            this.set('coordinate', coordinate);
            this.get('coordOverlay').setPosition(coordinate);
        }
    });

    return new CoordPopup();
});