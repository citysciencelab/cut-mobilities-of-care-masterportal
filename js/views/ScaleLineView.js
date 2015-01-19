define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'models/ScaleLine'
], function ($, _, Backbone, EventBus, ScaleLine) {

    var ScaleLineView = Backbone.View.extend({
        model: ScaleLine,
        initialize: function () {
            this.listenTo(this.model, 'change:reflength', this.render);
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
        },
        setMap: function (map) {
            this.model.set('map', map);
            this.model.calculateScale();
        },
        render: function () {
            this.$el.html('<span title="' + this.model.get('scale') + '">' + this.model.get('reflength') + '</span>');
            $('#scaleLineInner').html(this.$el);
        }
    });

    return ScaleLineView;
});
