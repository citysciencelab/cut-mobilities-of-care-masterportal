define(function (require) {
    var ScaleLine = require("modules/scaleline/model"),
        ScaleLineTemplate = require("text!modules/scaleline/template.html"),
        Config = require("config"),
        ScaleLineView;

    ScaleLineView = Backbone.View.extend({
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
                document.getElementsByClassName("footer")[0].appendChild(this.el);
                this.$el.css("right", 0);
            }
            else {
                document.getElementsByTagName("body")[0].appendChild(this.el);
                this.$el.css("left", 0);
            }
            return this;
        }
    });

    return ScaleLineView;
});
