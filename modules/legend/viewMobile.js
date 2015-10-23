define([
    "backbone",
    "text!modules/legend/template.html",
    "modules/legend/model",
    "eventbus"
], function (Backbone, LegendTemplate, Legend, EventBus) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        id: "base-modal-legend",
        className: "modal bs-example-modal-sm legend fade in",
        template: _.template(LegendTemplate),
        initialize: function () {
            EventBus.trigger("layerlist:getVisiblelayerList");

            this.listenTo(this.model, {
                "change:legendParams": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.show();
        },
        show: function () {
            this.$el.modal({
                backdrop: true,
                show: true
            });
        }
    });

    return LegendView;
});
