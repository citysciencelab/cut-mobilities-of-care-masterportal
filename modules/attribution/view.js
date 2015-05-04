define([
    'jquery',
    'backbone',
    'modules/attribution/model'
], function ($, Backbone, Attribution) {
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
});
