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
        var attr = this.model.toJSON(),
            that = this;

        $("#map").append(this.$el.html(this.template(attr)));
        this.$el.draggable({
            containment: "#map",
            handle: ".gfi-header",
            drag: function () {
                var rotAngle = that.model.get("rotateAngle");

                if (rotAngle === 0 || rotAngle === -180) {
                    $(".gfi-detached-table").css({

                        "-webkit-transform-origin": "50% 50%",
                        "-ms-transform-origin": "50% 50%",
                        "-moz-transform-origin": "50% 50%"
                    });
                }
                else if (rotAngle === -90) {
                    $(".gfi-detached-table").css({

                        "-webkit-transform-origin": "40% 70%",
                        "-ms-transform-origin": "40% 70%",
                        "-moz-transform-origin": "40% 70%"
                    });
                }
                else if (rotAngle === -270) {
                    $(".gfi-detached-table").css({

                        "-webkit-transform-origin": "30% 50%",
                        "-ms-transform-origin": "30% 50%",
                        "-moz-transform-origin": "30% 50%"
                    });
                }
            },
            stop: function (evt, ui) {
                // helper, so that "left" is never 0. needed for gfi/themes/view.js adjustGfiWindow()
                $(".gfi").css("left", ui.position.left + 1 + "px");
            }
        });
    },

    moveGFI: function (evt) {
        var touch = evt.originalEvent.touches[0],
            headerWidth = this.$el.find(".gfi-header").width(),
            width = this.$el.find(".gfi-header").width() / 2,
            height = this.$el.height(),
            headerHeight = this.$el.find(".gfi-header").height(),
            rotAngle = this.model.get("rotateAngle"),
            transformOrigin = headerWidth - 20 + "px " + headerHeight + "px",
            x,
            y;


        if (rotAngle === 0) {

            x = touch.clientX - width - 20;
            y = touch.clientY - headerHeight;

            // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
            if (x >= 0 && x < ($("#map").width() - $(".gfi-content").width() - 10) && y >= 0 && y < ($("#map").height() - $(".gfi-content").height() - 75)) {
                this.$el.css({
                    "left": x + "px",
                    "top": y + "px",
                    "-webkit-transform-origin": transformOrigin,
                    "-ms-transform-origin": transformOrigin,
                    "-moz-transform-origin": transformOrigin
                });
            }
        }
        else if (rotAngle === -90) {

            x = touch.clientX - headerWidth + 20;
            y = touch.clientY - width + 20;

            // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
            if (x + height >= 0 && x < ($("#map").width() - 1.5 * headerWidth - 75) && y >= 0 + headerHeight && y < ($("#map").height() - headerWidth - 10)) {
                this.$el.css({
                    "left": x + "px",
                    "top": y + "px",
                    "-webkit-transform-origin": transformOrigin,
                    "-ms-transform-origin": transformOrigin,
                    "-moz-transform-origin": transformOrigin
                });
            }
        }
        else if (rotAngle === -180) {

            x = touch.clientX - headerWidth - width + 20;
            y = touch.clientY - headerHeight;

            // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
            if (x + 1.5 * width >= 0 && x < ($("#map").width() - 2 * headerWidth) && y - height >= 0 && y < ($("#map").height() - height / 2)) {
                this.$el.css({
                    "left": x + "px",
                    "top": y + "px",
                    "-webkit-transform-origin": transformOrigin,
                    "-ms-transform-origin": transformOrigin,
                    "-moz-transform-origin": transformOrigin
                });
            }
        }
        else if (rotAngle === -270) {

            x = touch.clientX - headerWidth;
            y = touch.clientY + width - 20;

            // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
            if (x + height / 2 - headerHeight >= 0 && x < ($("#map").width() - headerWidth - 50) && y - headerWidth >= 0 && y < ($("#map").height() - headerWidth + width)) {
                this.$el.css({
                    "left": x + "px",
                    "top": y + "px",
                    "-webkit-transform-origin": transformOrigin,
                    "-ms-transform-origin": transformOrigin,
                    "-moz-transform-origin": transformOrigin
                });
            }
        }


    },

    toggle: function () {
        if (this.model.get("isVisible")) {
            this.$el.show();
            if (this.model.get("isMapMarkerVisible")) {
                Radio.trigger("MapMarker", "showMarker", this.model.get("coordinate"));
            }
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
        }
    },

    removeView: function () {
        Radio.trigger("MapMarker", "hideMarker");
        this.remove();
    },

    rotateGFI: function () {
        var width = this.$el.find(".gfi-header").width(),
            headerHeight = this.$el.find(".gfi-header").height();

        this.model.set("rotateAngle", this.model.get("rotateAngle") - 90);
        if (this.model.get("rotateAngle") === -360) {
            this.model.set("rotateAngle", 0);
        }
        $(".gfi-detached-table").css({

            "transform": "rotate(" + this.model.get("rotateAngle") + "deg)",
            "-webkit-transform-origin": width - 20 + "px " + headerHeight + "px",
            "-ms-transform-origin": width - 20 + "px " + headerHeight + "px",
            "-mos-transform-origin": width - 20 + "px " + headerHeight + "px"

        });
    }
});

export default GFIDetachedTableView;
