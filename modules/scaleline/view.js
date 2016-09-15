define([
    "backbone",
    "modules/scaleline/model",
    "text!modules/scaleline/template.html",
    "config"
], function (Backbone, ScaleLine, ScaleLineTemplate, Config) {

    var ScaleLineView = Backbone.View.extend({
        model: ScaleLine,
        className: "scale-line",
        template: _.template(ScaleLineTemplate),
        initialize: function () {
            this.listenTo(this.model, "change:scaleLineValue", this.render);
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));

            if (Config.footer && Config.footer.visibility === true) {
                $(".footer").append(this.$el);
                $(".scale-line").css("right", 0);
            }
            else {
                $("body").append(this.$el);
                $(".scale-line").css("left", 0);
            }

        }
    });

    return ScaleLineView;
});
