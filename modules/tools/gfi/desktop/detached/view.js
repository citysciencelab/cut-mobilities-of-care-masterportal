import DesktopView from "../../view";
import Template from "text-loader!../template.html";

const GFIDetachedView = DesktopView.extend({
    className: "gfi gfi-detached",
    template: _.template(Template),

    render: function () {
        var attr = this.model.toJSON();

        $("#map").append(this.$el.html(this.template(attr)));
        this.$el.css("maxWidth", Math.round($("#map").width() / 2.2));
        this.$el.draggable({
            containment: "#map",
            handle: ".gfi-header",
            stop: function (evt, ui) {
                // helper, so that "left" is never 0. needed for gfi/themes/view.js adjustGfiWindow()
                $(".gfi").css("left", (ui.position.left + 1) + "px");
                // $(".gfi").css("top", (ui.position.top - 50) + "px");
            }
        });

        $(".gfi-content").css({
            "max-height": window.innerHeight - 100 - 34 - 43 // 100 fixer Wert für navbar &co. 34 für header vom gfi 43 für den footer beim gfi
        });

    },

    toggle: function () {
        if (this.model.get("isVisible")) {
            this.$el.show();
            if (this.model.get("isMapMarkerVisible")) {
                Radio.trigger("MapMarker", "showMarker", this.model.get("coordinate"));
            }
            Radio.trigger("MapView", "setCenter", this.model.get("coordinate"));
            Radio.trigger("GFI", "afterRender");
        }
        else {
            this.$el.hide();
            if (this.$el.hasClass("gfi-text-html")) {
                this.$el.removeClass("gfi-text-html");
                this.$el.resizable({disabled: true});
                this.$el.css("width", "auto");
                this.$el.css("height", "auto");
                this.$el.resizable("destroy");
            }
            Radio.trigger("MapMarker", "hideMarker");
            Radio.trigger("GFI", "hideGFI");
        }
    },

    setMarker: function () {
        if (this.model.get("isVisible")) {
            if (this.model.get("isMapMarkerVisible")) {
                Radio.trigger("MapMarker", "showMarker", this.model.get("coordinate"));
            }
            Radio.trigger("MapView", "setCenter", this.model.get("coordinate"));
        }
    },

    removeView: function () {
        Radio.trigger("MapMarker", "hideMarker");
        this.remove();
    }
});

export default GFIDetachedView;
