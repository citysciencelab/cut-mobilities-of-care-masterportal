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
        className: 'panel panel-master',
        template: _.template(PrintWinTemplate),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:active', this.render);
        },
        events: {
            'click .glyphicon-chevron-up, .glyphicon-chevron-down': 'toggleContent',
            'click .close': 'togglePrintWin',
            'change select': 'updatePrintPage',
            'click button': 'getLayersForPrint'
        },
        togglePrintWin: function () {
            this.model.togglePrintWin();
        },
        toggleContent: function () {
            $('#printWin > .panel-body').toggle('slow');
            $('#printWin > .panel-heading > .toggleChevron').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        },
        updatePrintPage: function () {
            this.model.updatePrintPage();
        },
        getLayersForPrint: function () {
            $('#loader').show();
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
