define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Tools.html',
    'models/Tools'
], function ($, _, Backbone, ToolsTemplate, Tools) {

    var ToolsView = Backbone.View.extend({
        model: Tools,
        el: '#tools',
        template: _.template(ToolsTemplate),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change', this.render);
        },
        events: {
            'click #coordinateMenu': 'activateCoordinate',
            'click #gfiMenu': 'activateGFI',
            'click #measureMenu': 'activateMeasure'
        },
        activateCoordinate: function () {
            this.model.activateCoordinate();
        },
        activateGFI: function () {
            this.model.activateGFI();
        },
        activateMeasure: function () {
            this.model.activateMeasure();
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        }
    });

    return ToolsView;
});
