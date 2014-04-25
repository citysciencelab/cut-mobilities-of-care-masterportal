define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/CoordPopup.html',
    'models/CoordPopup',
    'eventbus'
], function ($, _, Backbone, CoordPopupTemplate, CoordPopup, EventBus) {

    var CoordPopupView = Backbone.View.extend({
        template: _.template(CoordPopupTemplate),
        events: {
            'click': 'test' // hier bin ich stehen geblieben...funkt noch nicht
        },
        initialize: function () {
            this.model = CoordPopup;
            EventBus.on('togglePopup', this.togglePopup, this);
        },
        togglePopup: function (status) {
            this.model.destroyPopup();
            if (status === true) {
                EventBus.on('createPopup', this.createPopup, this);
            }
            else {
                EventBus.off('createPopup', this.createPopup, this);
            }
        },
        createPopup: function (evt) {
            this.model.destroyPopup();
            this.model.setPosition(evt.coordinate);
            var attr = this.model.toJSON();
            $(this.model.get('element')).popover({
                'placement': 'auto',
                'html': true,
                'content': this.template(attr)
            });
            this.model.showPopup();
        },
        test: function () {
            console.log(23423);
        }
    });

    return CoordPopupView;
});