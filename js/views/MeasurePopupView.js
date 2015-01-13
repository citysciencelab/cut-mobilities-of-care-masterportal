define([
    'jquery',
    'underscore',
    'backbone',
    'models/MeasurePopup'
], function ($, _, Backbone, MeasurePopup) {

    var MeasurePopupView = Backbone.View.extend({
        model: MeasurePopup,
        className: 'alert alert-info',
        attributes: {
            role: 'alert'
        },
        template: '<div class="alert alert-success" role="alert"></div>',
        initialize: function () {
            this.listenTo(this.model, 'change:result', this.render);
        },
        render: function () {
            this.$el.html('<span>' + this.model.get('result') + '</span>');
            $('#measurePopup').html(this.$el);
        }
    });

    return MeasurePopupView;
});
