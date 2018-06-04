define(function (require) {

    var DesktopView = require("modules/tools/gfi/view"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/tools/gfi/table/template.html"),
        GFIDetachedTableView;

    GFIDetachedTableView = DesktopView.extend({
        className: "gfi gfi-detached gfi-detached-table",
        template: _.template(Template),

        render: function () {
            var attr = this.model.toJSON();

            $("#map").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".gfi-header",
                stop: function (evt, ui) {
                    // helper, so that "left" is never 0. needed for gfi/themes/view.js adjustGfiWindow()
                    $(".gfi").css("left", (ui.position.left + 1) + "px");
                    // $(".gfi").css("top", (ui.position.top - 50) + "px");
                }
            });

            this.$el.on("touchmove", function (evt) {
                var touch = evt.originalEvent.touches[0],
                    width = $(this).width() / 2,
                    x = touch.clientX - width,
                    y = touch.clientY;

                $(this).css({
                    "left": x + "px",
                    "top": y + "px"
                });
            });
        },

        toggle: function () {
            if (this.model.getIsVisible() === true) {
                this.$el.show();
                Radio.trigger("MapMarker", "showMarker", this.model.getCoordinate());
                Radio.trigger("GFI", "afterRender");
            }
            else {
                this.$el.hide();
                Radio.trigger("MapMarker", "hideMarker");
            }
        },

        setMarker: function () {
            if (this.model.getIsVisible() === true) {
                Radio.trigger("MapMarker", "showMarker", this.model.getCoordinate());
                Radio.trigger("MapView", "setCenter", this.model.getCoordinate());
            }
        },

        removeView: function () {
            Radio.trigger("MapMarker", "hideMarker");
            this.remove();
        }
    });

    return GFIDetachedTableView;
});
