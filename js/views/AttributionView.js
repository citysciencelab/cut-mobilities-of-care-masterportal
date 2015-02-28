define([
    'jquery',
    'underscore',
    'backbone',
    'models/Attribution'
], function ($, _, Backbone, Attribution) {

    var AttributionView = Backbone.View.extend({
        model: Attribution,
        /*events: {
            'click .buttonStandpunkt': 'getOrientation',
            'click .buttonPOI': 'getPOI'
        },*/
        initialize: function () {
            this.render();
        },
        render: function () {
            $(window).resize($.proxy(function () {
                if (window.innerWidth < 768) {
                    this.model.get('attribution').setCollapsed(true);
                } else {
                    this.model.get('attribution').setCollapsed(false);
                }
            }, this));
        }
    });

    return AttributionView;
});
