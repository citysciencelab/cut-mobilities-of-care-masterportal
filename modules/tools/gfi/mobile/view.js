import GFIView from "../view";
import Template from "text-loader!./template.html";
import "bootstrap/js/modal";

const GFIMobileView = GFIView.extend({
    className: "modal fade gfi-mobile",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.$el.modal({
            backdrop: "static",
            show: false
        });
    },

    toggle: function () {
        if (this.model.get("isVisible") === true) {
            this.$el.modal("show");

            this.$el.on("shown.bs.modal", function () {
                Radio.trigger("GFI", "afterRender");
            });
        }
        else {
            this.$el.modal("hide");
        }
    },

    removeView: function () {
        this.$el.modal("hide");
        this.remove();
    }
});

export default GFIMobileView;
