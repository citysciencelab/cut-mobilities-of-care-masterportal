define(function (require) {

    var DesktopView = require("modules/tools/gfi/view"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/tools/gfi/desktop/template.html"),
        GFIDetachedView;

    GFIDetachedView = DesktopView.extend({
        className: "gfi gfi-detached",
        template: _.template(Template),

        /**
         * Zeichnet das Template und macht es "draggable"
         */
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
        },

        /**
         * Blendet das Popover ein oder aus
         */
        toggle: function () {
            if (this.model.getIsVisible() === true) {
                this.$el.show();
                Radio.trigger("MapMarker", "showMarker", this.model.getCoordinate());
                Radio.trigger("MapView", "setCenter", this.model.getCoordinate());
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

    return GFIDetachedView;
});
