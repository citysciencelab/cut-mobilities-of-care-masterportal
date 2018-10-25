import DesktopView from "../../view";
import Template from "text-loader!../template.html";
import "bootstrap/js/tooltip";
import "bootstrap/js/popover";

const GFIAttachedView = DesktopView.extend({
    className: "gfi gfi-attached",
    template: _.template(Template),

    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $(this.model.getOverlayElement()).popover({
            content: this.$el,
            html: true,
            viewport: ".ol-viewport",
            placement: function () {
                if (this.getPosition().top > $("#map").height() / 2) {
                    return "top";
                }

                return "bottom";

            }
        });
    },

    /**
     * Hängt ein DOM-Element an den body
     * Wird für das ol.Overlay benötigt
     * @returns {void}
     */
    renderDomElementToBody: function () {
        $("body").append("<div id='gfipopup'></div>");
    },

    /**
     * Blendet das Popover ein oder aus
     * @returns {void}
     */
    toggle: function () {
        if (this.model.get("isVisible") === true) {
            $(this.model.getOverlayElement()).popover("show");
            Radio.trigger("GFI", "afterRender");
        }
        else {
            $(this.model.getOverlayElement()).popover("hide");
        }
    },

    removeView: function () {
        $(this.model.getOverlayElement()).popover("destroy");
        $("#gfipopup").remove();
        this.remove();
    }
});

export default GFIAttachedView;
