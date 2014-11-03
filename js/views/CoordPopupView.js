define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/CoordPopup.html',
    'models/CoordPopup'
], function ($, _, Backbone, CoordPopupTemplate, CoordPopup) {

    var CoordPopupView = Backbone.View.extend({
        model: CoordPopup,
        id: 'coordPopup',
        template: _.template(CoordPopupTemplate),
        events: {
            'click .close': 'destroy'
        },
        initialize: function () {
            this.listenTo(this.model, 'change:coordinateGeo', this.render);
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
