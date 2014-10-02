define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/PrintWin.html',
    'models/Print'
], function ($, _, Backbone, PrintWinTemplate, Print) {

    var PrintView = Backbone.View.extend({
        model: Print,
        id: 'printWin',
        className: 'panel panel-print',
        template: _.template(PrintWinTemplate),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:active', this.render);
        },
        events: {
            'click .close': 'toggleWin',
            'change select': 'updatePrintPage',
            'click button': 'getLayersForPrint'
        },
        toggleWin: function () {
            this.model.togglePrintWin();
        },
        updatePrintPage: function () {
            this.model.updatePrintPage();
        },
        getLayersForPrint: function () {
            this.model.getLayersForPrint();
        },
        render: function () {
            var attr = this.model.toJSON();
            $('#toggleRow').append(this.$el.html(this.template(attr)));
            this.model.updatePrintPage();
        }
    });

    return PrintView;
});
