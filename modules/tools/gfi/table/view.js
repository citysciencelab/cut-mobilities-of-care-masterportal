import DesktopView from "../view";
import Template from "text-loader!./template.html";

const GFIDetachedTableView = DesktopView.extend({
    className: "gfi gfi-detached gfi-detached-table",
    template: _.template(Template),
    events: {
        "click .icon-turnarticle": "rotateGFI",
        "click .glyphicon-remove": "hideGFI",
        "touchmove .gfi-header": "moveGFI",
        "click .pager-right": "renderNext",
        "click .pager-left": "renderPrevious"
    },
    render: function () {
        var attr = this.model.toJSON();

        $("#map").append(this.$el.html(this.template(attr)));
        this.$el.draggable({
            containment: "#map",
            handle: ".gfi-header",
            stop: function (evt, ui) {
                // helper, so that "left" is never 0. needed for gfi/themes/view.js adjustGfiWindow()
                $(".gfi").css("left", ui.position.left + 1 + "px");
            }
        });
    },

    moveGFI: function (evt) {
        var touch = evt.originalEvent.touches[0],
            width = this.$el.find(".gfi-header").width() / 2,
            x = touch.clientX - width,
            y = touch.clientY;

        this.$el.css({
            "left": x + "px",
            "top": y + "px"
        });
    },

    toggle: function () {
        if (this.model.get("isVisible") === true) {
            this.$el.show();
            Radio.trigger("MapMarker", "showMarker", this.model.get("coordinate"));
            Radio.trigger("GFI", "afterRender");
        }
        else {
            this.$el.hide();
            Radio.trigger("MapMarker", "hideMarker");
        }
    },

    setMarker: function () {
        if (this.model.get("isVisible") === true) {
            Radio.trigger("MapMarker", "showMarker", this.model.get("coordinate"));
            Radio.trigger("MapView", "setCenter", this.model.get("coordinate"));
        }
    },

    removeView: function () {
        Radio.trigger("MapMarker", "hideMarker");
        this.remove();
    },

    rotateGFI: function () {
        this.model.set("rotateAngle", this.model.get("rotateAngle") - 90);
        if (this.model.get("rotateAngle") === -360) {
            this.model.set("rotateAngle", 0);
        }
        $(".gfi-detached-table").css({
            "transform": "rotate(" + this.model.get("rotateAngle") + "deg)",
            "-webkit-transform-origin": "50% 52%"
        });
    }
});

export default GFIDetachedTableView;
