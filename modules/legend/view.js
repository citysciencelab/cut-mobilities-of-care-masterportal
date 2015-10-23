define([
    "backbone",
    "text!modules/legend/template.html",
    "modules/legend/model",
    "eventbus"
], function (Backbone, LegendTemplate, Legend, EventBus) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        className: "legend-win",
        template: _.template(LegendTemplate),
        events: {
            "click .legend-win-header > .win-close": "toggle"
        },
        initialize: function () {
            $(window).resize(function() {
                if ($(".legend-win-content").height() !== null) {
                    $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
                }
            });

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
            $("body").append(this.$el.html(this.template(attr)));
            $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
            this.$el.draggable({
                containment: "#map",
                handle: ".legend-win-header"
            });
        },

        toggle: function () {
            this.$el.toggle();
        }
    });

    return LegendView;
});
