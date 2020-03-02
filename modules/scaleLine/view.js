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
        const attr = this.model.toJSON(),
            i18nextIsEnabled = i18next.options.hasOwnProperty("isEnabled") ? i18next.options.isEnabled() : false;

        this.$el.html(this.template(attr));
        if (document.getElementsByClassName("footer").length > 0) {
            document.getElementsByClassName("footer")[0].appendChild(this.el);
        }
        else {
            document.getElementsByClassName("ol-viewport")[0].appendChild(this.el);
        }
        if (i18next && i18nextIsEnabled) {
            this.$el.css({
                "right": "0px"
            });
        }
        return this;
    }
});

export default ScaleLineView;
