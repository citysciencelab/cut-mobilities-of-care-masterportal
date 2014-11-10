define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Legend.html',
    'models/Legend',
    'eventbus'
], function ($, _, Backbone, LegendTemplate, Legend, EventBus) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        id: 'base-modal',
        className: 'modal fade bs-example-modal-sm',
        template: _.template(LegendTemplate),
        initialize: function () {
            this.render();
            EventBus.on('showLegend', this.show, this);
            EventBus.on('toggleLegendWin', this.toggleLegendWin, this);
        },
        events: {
           'click button': 'onLegendClick'
        },
        show: function (params) {
            this.model.setAttributions(params);
            this.render();
            this.$el.modal({
                backdrop: 'static',
                show: true
            });
        },

        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        onLegendClick: function(){
        },
        toggleLegendWin: function (){
            EventBus.trigger('getVisibleLayer', this);
        }
    });

    return LegendView;
});
