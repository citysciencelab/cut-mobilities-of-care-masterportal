import ScaleLineModel from "./model";
import ScaleLineTemplate from "text-loader!./template.html";

const ScaleLineView = Backbone.View.extend({
    initialize: function () {
        this.model = new ScaleLineModel();
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
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.render
        });
        this.render();
    },
    className: "scale-line",
    template: _.template(ScaleLineTemplate),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (document.getElementsByClassName("footer").length > 0) {
            document.getElementsByClassName("footer")[0].appendChild(this.el);
        }
        else if (document.getElementsByClassName("ol-viewport").length > 0) {
            document.getElementsByClassName("ol-viewport")[0].appendChild(this.el);
        }
        if (!i18next.options.isEnabled()) {
            this.$el.css({
                "right": "0px"
            });
        }
        return this;
    }
});

export default ScaleLineView;
