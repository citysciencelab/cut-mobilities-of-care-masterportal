define([
    'jquery',
    'underscore',
    'backbone',
    'modules/attribution/model',
    'config'
], function ($, _, Backbone, Attribution, Config) {
    if (Config.attributions && Config.attributions === true) {
        var AttributionView = Backbone.View.extend({
            model: Attribution,
            initialize: function () {
                $(window).resize($.proxy(function () {
                    this.render();
                }, this));
                this.listenTo(this.model, 'change:attribution', this.render);
            },
            render: function () {
                if (window.innerWidth < 768) {
                    this.model.get('attribution').setCollapsed(true);
                } else {
                    this.model.get('attribution').setCollapsed(false);
                }
            }
        });

        return AttributionView;
    }
});
