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
            'click #span': 'destroy'
        },
        initialize: function () {
            this.model = CoordPopup;
            this.listenTo(this.model, 'change', this.render);
        },
        render: function (evt) {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(this.model.get('element')).popover({
                'placement': 'auto',
                'html': true,
                'content': this.$el
            });
            this.model.showPopup();
        },
        destroy: function () {
            this.model.destroyPopup();
        }
    });

    return CoordPopupView;
});