define(function (require) {
    var $ = require("jquery"),
        LegendTemplate = require("text!modules/legend/desktop/template.html"),
        ContentTemplate = require("text!modules/legend/content.html"),
        LegendView;

    LegendView = Backbone.View.extend({
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function () {
            $(window).resize(function () {
                if ($(".legend-win-content").height() !== null) {
                    $(".legend-win-content").css("max-height", $(window).height() * 0.7);
                }
            });

            this.listenTo(this.model, {
                "change:legendParams": this.paramsChanged,
                "change:paramsStyleWMSArray": this.paramsChanged
            });

            this.listenTo(Radio.channel("Legend"), {
                "toggleLegendWin": this.toggle
            });

            this.listenTo(Radio.channel("Map"), {
                "updateSize": this.updateLegendSize
            });

            if (this.model.get("isActive")) {
                this.toggle();
            }
        },
        className: "legend-win",
        template: _.template(LegendTemplate),
        contentTemplate: _.template(ContentTemplate),

        /**
         * Steuert Maßnahmen zur Aufbereitung der Legende.
         * @listens this.model~change:legendParams
         * @returns {void}
         */
        paramsChanged: function () {
            var legendParams = this.model.get("legendParams");

            // Filtern von this.unset("legendParams")
            if (!_.isUndefined(legendParams) && legendParams.length > 0) {
                Radio.trigger("Layer", "updateLayerInfo", this.model.get("paramsStyleWMS").styleWMSName);
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

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
            $(".legend-win-content").css("max-height", $(".lgv-container").height() * 0.7);
            this.$el.draggable({
                containment: "#map",
                handle: ".legend-win-header"
            });
            return this;
        },

        toggle: function () {
            this.render();
            this.$el.toggle();

            if (this.$el.css("display") === "block") {
                this.model.setLayerList();
            }
        },

        removeView: function () {
            this.$el.hide();
            this.remove();
        },

        /**
         * Passt die Höhe der Legende an die Klasse lgv-container an.
         * Derzeit wird die Funktion ausgeführt auf die updateSize Funtkion der Map.
         * @returns {void}
         */
        updateLegendSize: function () {
            $(".legend-win-content").css("max-height", $(".lgv-container").height() * 0.7);
        }
    });

    return LegendView;
});
