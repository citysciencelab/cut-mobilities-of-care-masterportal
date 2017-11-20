define([
    "backbone",
    "text!modules/legend/desktop/template.html",
    "backbone.radio",
    "jqueryui/widgets/draggable"
], function (Backbone, LegendTemplate, Radio) {

    var LegendView = Backbone.View.extend({
        className: "legend-win",
        template: _.template(LegendTemplate),
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function (Model) {
            this.model = Model;

            $(window).resize(function () {
                if ($(".legend-win-content").height() !== null) {
                    $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
                }
            });

            this.listenTo(this.model, {
                "change:legendParams": this.paramsChanged,
                "change:paramsStyleWMSArray": this.paramsChanged
            });

            this.listenTo(Radio.channel("Legend"), {
                "toggleLegendWin": this.toggle
            });

            this.render();

            Radio.trigger("Autostart", "initializedModul", "legend");

            if (this.model.getVisible()) {
                this.toggle();
            }

            this.listenTo(Radio.channel("Map"), {
                "updateSize": this.updateLegendSize
            });
        },

        paramsChanged: function () {
            Radio.trigger("Layer", "updateLayerInfo", this.model.get("paramsStyleWMS").styleWMSName);
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
            $(".legend-win-content").css("max-height", ($(".lgv-container").height() * 0.7));
            this.$el.draggable({
                containment: "#map",
                handle: ".legend-win-header"
            });
        },

        toggle: function () {
            var legendModel = Radio.request("ModelList", "getModelByAttributes", {id: "legend"}),
                visible = !this.$el.is(":visible");

            this.model.setVisible(visible); // speichere neuen Status
            this.render();
            this.$el.toggle();

            if (this.$el.css("display") === "block") {
                legendModel.setIsActive(true);
            }
            else {
                legendModel.setIsActive(false);
                Radio.trigger("ModelList", "setModelAttributesById", "gfi", {isActive: true});
            }
        },
        /**
         * Entfernt diese view
         */
        removeView: function () {
            this.$el.hide();

            this.remove();
        },

        /**
         * Passt die Höhe der Legende an die Klasse lgv-container an.
         * Derzeit wird die Funktion ausgeführt auf die updateSize Funtkion der Map.
         */
        updateLegendSize: function () {
            $(".legend-win-content").css("max-height", ($(".lgv-container").height() * 0.7));
        }
    });

    return LegendView;
});
