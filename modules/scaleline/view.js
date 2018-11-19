import ScaleLine from "./model";
import ScaleLineTemplate from "text-loader!./template.html";

const ScaleLineView = Backbone.View.extend({
    initialize: function () {
        this.model = new ScaleLine();
        this.listenTo(this.model, "change:scaleLineValue", this.render);
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (mode === "Oblique") {
                    this.$el.hide();
                }
                else {
                    this.$el.show();
                }
            }
        });
        this.render();
    },
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
    }
});

export default ScaleLineView;
