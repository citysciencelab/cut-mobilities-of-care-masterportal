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
        initialize: function (Model) {
            this.model = Model;

            this.listenTo(this.model, {
                "change:legendParams": this.render
            });

            this.listenTo(Radio.channel("Legend"), {
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
        },
        /**
         * Entfernt diese view
         */
        removeView: function () {
            this.$el.hide();

            this.remove();
        }
    });

    return MobileLegendView;
});
