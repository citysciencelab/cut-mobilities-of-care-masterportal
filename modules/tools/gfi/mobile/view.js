define(function (require) {
    require("bootstrap/modal");

    var GFIView = require("modules/tools/gfi/view"),
        Template = require("text!modules/tools/gfi/mobile/template.html"),
        GFIMobileView;

    GFIMobileView = GFIView.extend({
        className: "modal fade gfi-mobile",
        template: _.template(Template),

        /**
         * Zeichnet das Template und erstellt das Bootstrap Modal
         */
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.$el.modal({
                backdrop: "static",
                show: false
            });
        },

        /**
         * Blendet das Modal ein oder aus
         */
        toggle: function () {
            if (this.model.getIsVisible() === true) {
                this.$el.modal("show");
                Radio.trigger("GFI", "afterRender");
            }
            else {
                this.$el.modal("hide");
            }
        },

        /**
         * Löscht das Modal Backdrop und sich selbst
         */
        removeView: function () {
            this.$el.modal("hide");
            this.remove();
        }
    });

    return GFIMobileView;
});
