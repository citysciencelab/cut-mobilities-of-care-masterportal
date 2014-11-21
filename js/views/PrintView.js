define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/PrintWin.html',
    'models/Print',
    'eventbus'
], function ($, _, Backbone, PrintWinTemplate, Print, EventBus) {

    var PrintView = Backbone.View.extend({
        model: Print,
        id: 'printWin',
        className: 'panel panel-master',
        template: _.template(PrintWinTemplate),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:active', this.updatePrintPage);
            EventBus.on('togglePrintWin', this.togglePrintWin, this);
        },
        events: {
            'click .glyphicon-chevron-up, .glyphicon-chevron-down': 'toggleContent',
            'click .close': 'togglePrintWin',
            'change select': 'updatePrintPage',
            'click button': 'getLayersForPrint'
        },
        togglePrintWin: function () {
            $('#printWin').toggle();
            ($('#printWin').css('display') === 'block') ? this.model.set('active', true) : this.model.set('active', false);
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
        }
    });

    return PrintView;
});
