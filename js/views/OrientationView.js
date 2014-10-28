define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Orientation.html',
    'models/Orientation'
], function ($, _, Backbone, OrientationTemplate, Orientation) {

    var OrientationView = Backbone.View.extend({
        model: Orientation,
        template: _.template(OrientationTemplate),
        events: {
            'click .close': 'destroy'
        },
        initialize: function () {
            this.listenTo(this.model, 'change:position', this.render);
        },
        render: function (evt) {
            var test = Map.getView();
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

    return OrientationView;
});
