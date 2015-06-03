define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'modules/scaleline/model',
    'text!modules/scaleline/template.html',
    "config",
    "models/map"
], function ($, _, Backbone, EventBus, ScaleLine, ScaleLineTemplate, Config, Map) {

    var ScaleLineView = Backbone.View.extend({
        model: ScaleLine,
        className: 'scale-line',
        template: _.template(ScaleLineTemplate),
        initialize: function () {
            this.listenTo(this.model, 'change:reflength', this.render);
            EventBus.on('setMap', this.setMap, this);
            EventBus.trigger('getMap', this);
        },
        setMap: function (map) {
            if (this.model.get('map') === '') {
                this.model.set('map', map);
                this.model.calculateScale();
            }
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            if (Config.footer && Config.footer === true) {
                $('.footer').append(this.$el);
                $('.scale-line').addClass("pull-right");
                this.$el.removeClass("scale-line");
            }
            else {
                $('body').append(this.$el);
            }

        }
    });

    return ScaleLineView;
});
