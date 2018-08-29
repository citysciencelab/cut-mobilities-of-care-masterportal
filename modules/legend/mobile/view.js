define(function (require) {
    var LegendTemplate = require("text!modules/legend/mobile/template.html"),
        Radio = require("backbone.radio"),
        ContentTemplate = require("text!modules/legend/content.html"),
        MobileLegendView;

    MobileLegendView = Backbone.View.extend({
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:legendParams": this.paramsChanged
            });

            this.listenTo(Radio.channel("Legend"), {
                "toggleLegendWin": this.toggle
            });

            this.model.setLayerList();

            if (this.model.get("isActive")) {
                this.toggle();
            }
        },
        id: "base-modal-legend",
        className: "modal bs-example-modal-sm legend fade in",
        template: _.template(LegendTemplate),
        contentTemplate: _.template(ContentTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },

        /**
         * Steuert Maßnahmen zur Aufbereitung der Legende.
         * @listens this.model~change:legendParams
         * @returns {void}
         */
        paramsChanged: function () {
            var legendParams = this.model.get("legendParams");

            // Filtern von this.unset("legendParams")
            if (!_.isUndefined(legendParams) && legendParams.length > 0) {
                this.addContentHTML(legendParams);
                this.render();
            }
        },

        /**
         * Fügt den Legendendefinitionen das gerenderte HTML hinzu.
         * Dieses wird im template benötigt.
         * @param {object[]} legendParams Legendenobjekte by reference
         * @returns {void}
         */
        addContentHTML: function (legendParams) {
            _.each(legendParams, function (legendDefinition) {
                _.each(legendDefinition.legend, function (legend) {
                    legend.html = this.contentTemplate(legend);
                }, this);
            }, this);
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
