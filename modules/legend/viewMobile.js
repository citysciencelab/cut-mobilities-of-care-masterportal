define([
    "backbone",
    "text!modules/legend/templateMobile.html",
    "modules/legend/model",
    "eventbus"
], function (Backbone, LegendTemplate, Legend, EventBus) {

    var MobileLegendView = Backbone.View.extend({
        model: Legend,
        id: "base-modal-legend",
        className: "modal bs-example-modal-sm legend fade in",
        template: _.template(LegendTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:legendParams": this.render
            });

            this.listenTo(EventBus, {
                "toggleLegendWin": this.toggle
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },

        toggle: function () {
            this.$el.modal({
                backdrop: true,
                show: true
            });
        }
    });

    return MobileLegendView;
});
