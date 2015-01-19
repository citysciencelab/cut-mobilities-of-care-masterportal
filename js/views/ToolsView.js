define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Tools.html',
    'models/Tools',
    'eventbus'
    ], function ($, _, Backbone, ToolsTemplate, Tools, EventBus) {

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
                'click #measureMenu': 'activateMeasure',
                'click #printMenu': 'activatePrint'
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
            activatePrint: function () {
                // EventBus.trigger('togglePrintWin');
                EventBus.trigger('toggleWin', ['print', 'Druckeinstellungen', 'glyphicon-print']);
            },
            render: function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
            }
        });

        return ToolsView;
    });
