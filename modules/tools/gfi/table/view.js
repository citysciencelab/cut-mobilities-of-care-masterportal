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
            headerHeight = this.$el.find(".gfi-header").height(),
            height = this.$el.height(),
            rotAngle = this.model.get("rotateAngle");
            console.log(rotAngle)
            
        if (rotAngle === 0){
        	console.log("rotAngel = 0")
            var x = touch.clientX - width,
                y = touch.clientY - 20;
          }
        else if (rotAngle === -90){
        	  var x = touch.clientX - width + 40,
                y = touch.clientY - height / 2;       	
        }
        else if (rotAngle === -180){
        	  var x = touch.clientX - width,
                y = touch.clientY - height + 10;       	
        }
        else if (rotAngle === -270){
        	  var x = touch.clientX - width - 80,
                y = touch.clientY - height / 2;       	
        }


        // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
        if (x >= 0 && x < ($("#map").width() - $(".gfi-content").width() - 10) && y >= 0 && y < ($("#map").height() - $(".gfi-content").height() - 75)) {
            this.$el.css({
                "left": x + "px",
                "top": y + "px", 
                "-webkit-transform-origin": "50% 50%"
            });
        }
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
            "-webkit-transform-origin": "85% 10%"
        });
    }
});

export default GFIDetachedTableView;
