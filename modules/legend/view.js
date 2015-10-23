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
        initialize: function () {
            $(window).resize(function() {
                if ($(".legend-win-content").height() !== null) {
                    $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
                }
            });

            EventBus.trigger("layerlist:getVisiblelayerList");

            this.listenTo(this.model, {
                "change:legendParams": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
            $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
        }
    });

    return LegendView;
});
