define(function (require) {
    var $ = require("jquery"),
        LegendTemplate = require("text!modules/legend/mobile/template.html"),
        Radio = require("backbone.radio"),
        ContentTemplate = require("text!modules/legend/content.html"),
        LegendView;

    MobileLegendView = Backbone.View.extend({
        id: "base-modal-legend",
        className: "modal bs-example-modal-sm legend fade in",
        template: _.template(LegendTemplate),
        contentTemplate: _.template(ContentTemplate),
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function (Model) {
            this.model = Model;

            this.listenTo(this.model, {
                "change:legendParams": this.paramsChanged
            });

            this.listenTo(Radio.channel("Legend"), {
                "toggleLegendWin": this.toggle
            });

            this.render();

            if (this.model.get("visible")) {
                this.toggle();
            }
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },

        paramsChanged: function () {
            this.addContentHTML();
            this.render();
        },

        /**
         * Fügt den Legendendefinitionen das gerenderte HTML hinzu. 
         * Dieses wird im template benötigt.
         */
        addContentHTML: function () {
            var legendParams = this.model.get("legendParams");

            _.each(legendParams, function (legendDefinition) {
                _.each(legendDefinition.legend, function (legend) {
                    legend.html = this.contentTemplate(legend)
                }, this);
            }, this);
        },

        toggle: function () {
            var visible = !this.$el.is(":visible");

            this.model.setVisible(visible); // speichere neuen Status
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
