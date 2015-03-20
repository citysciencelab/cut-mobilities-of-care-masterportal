define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'models/ScaleLine',
    'text!templates/ScaleLine.html'
], function ($, _, Backbone, EventBus, ScaleLine, ScaleLineTemplate) {

    var ScaleLineView = Backbone.View.extend({
        model: ScaleLine,
        className: 'scale-line',
        template: _.template(ScaleLineTemplate),
        initialize: function () {
            this.listenTo(this.model, 'change:reflength', this.render);
            EventBus.on('setMap', this.setMap, this);
        },
        setMap: function (map) {
            this.model.set('map', map);
            this.model.calculateScale();
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $('body').append(this.$el);
        }
    });

    return ScaleLineView;
});
