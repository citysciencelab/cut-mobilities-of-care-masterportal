define(function (require) {
    var ScaleLine = require("modules/scaleline/model"),
        ScaleLineTemplate = require("text!modules/scaleline/template.html"),
        ScaleLineView;

    ScaleLineView = Backbone.View.extend({
        initialize: function () {
            this.listenTo(this.model, "change:scaleLineValue", this.render);
            this.listenTo(Radio.channel("Map"), {
                "change": function (mode) {
                    this.toggleSupportedVisibility(mode);
                }
            });
            this.render();
        },
        model: new ScaleLine(),
        className: "scale-line",
        template: _.template(ScaleLineTemplate),
        render: function () {
            var attr = this.model.toJSON();

            if (!_.isEmpty(document.getElementsByClassName("footer"))) {
                this.$el.html(this.template(attr));
                document.getElementsByClassName("footer")[0].appendChild(this.el);
                this.$el.css("right", 0);
            }

            return this;
        },
        toggleSupportedVisibility: function (mode) {
            if (mode === "2D") {
                this.$el.show();
            }
            else if (mode === "3D") {
                this.$el.hide();
            }
            else if (mode === "Oblique") {
                this.$el.hide();
            }
            else {
                this.$el.hide();
            }
        }
    });

    return ScaleLineView;
});
