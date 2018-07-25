define(function (require) {
    var GFIView = require("modules/tools/gfi/view"),
        Template = require("text!modules/tools/gfi/mobile/template.html"),
        GFIMobileView;

    require("bootstrap/modal");

    GFIMobileView = GFIView.extend({
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
                Radio.trigger("GFI", "afterRender");
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

    return GFIMobileView;
});
