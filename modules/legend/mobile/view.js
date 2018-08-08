define([
    "backbone",
    "text!modules/legend/mobile/template.html",
    "backbone.radio",
    "bootstrap/modal"
], function (Backbone, LegendTemplate, Radio) {

    var MobileLegendView = Backbone.View.extend({
        id: "base-modal-legend",
        className: "modal bs-example-modal-sm legend fade in",
        template: _.template(LegendTemplate),
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:legendParams": this.render
            });

            this.listenTo(Radio.channel("Legend"), {
                "toggleLegendWin": this.toggle
            });

            this.render();

            if (this.model.get("isActive")) {
                this.toggle();
            }
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },

        toggle: function () {
            if (this.model.get("isActive") === true) {
                this.$el.modal("show");
            }
            else {
                this.$el.modal("hide");
            }
        },

        removeView: function () {
            this.$el.modal("hide");
            this.remove();
        }
    });

    return MobileLegendView;
});
