/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Tools.html',
    'views/CoordPopupView'
], function ($, _, Backbone, ToolsTemplate) {

    var ToolsView = Backbone.View.extend({
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