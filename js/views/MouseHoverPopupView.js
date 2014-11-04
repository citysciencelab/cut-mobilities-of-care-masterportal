define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/MouseHoverPopup.html',
    'models/MouseHoverPopup'
], function ($, _, Backbone, MouseHoverPopupTemplate, MouseHoverPopup) {

    var MouseHoverPopupView = Backbone.View.extend({
        model: MouseHoverPopup,
        className: 'alert alert-info',
        attributes: {
            role: 'alert'
        },
        template: '<div class="alert alert-success" role="alert"></div>',
        initialize: function () {
            this.listenTo(this.model, 'change:result', this.render);
        },
        render: function () {
            if (this.model.get('result') === '') {
                $('#mousehoverpopup').hide();
                $('#mousehoverpopup').html('');
            }
            else {
                $('#mousehoverpopup').stop(true);
                this.$el.html('<span>' + this.model.get('result') + '</span>');
                $('#mousehoverpopup').html(this.$el);
                var that = this;
                $('#mousehoverpopup').fadeIn(200).delay(3000).slideUp(200, function () {
                    that.model.set('result', '');
                });
            }
        }
    });

    return MouseHoverPopupView;
});
