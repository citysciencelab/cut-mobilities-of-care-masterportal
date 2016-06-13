define([
    "backbone",
    "config"
], function (Backbone, Config) {

    var ControlsView = Backbone.View.extend({
        className: "container-fluid controls-view",
        initialize: function () {
            this.render();
            if (_.has(Config.controls, "toggleMenu") === true && Config.controls.toggleMenu === true) {
                require(["modules/controls/togglemenu/view"], function (ToggleMenuControlView) {
                    new ToggleMenuControlView();
                });
            }
            if (_.has(Config.controls, "zoom") === true && Config.controls.zoom === true) {
                require(["modules/controls/zoom/view"], function (ZoomControlView) {
                    new ZoomControlView();
                });
            }
            if (_.has(Config.controls, "orientation") === true && Config.controls.orientation === "allways" || Config.controls.orientation === "once") {
                require(["modules/controls/orientation/view"], function (OrientationView) {
                    new OrientationView();
                });
            }
            if (_.has(Config.controls, "mousePosition") === true && Config.controls.mousePosition === true) {
                require(["modules/controls/mousePosition/view"], function (MousePositionView) {
                    new MousePositionView();
                });
            }
            if (_.has(Config.controls, "fullScreen") === true && Config.controls.fullScreen === true) {
                require(["modules/controls/fullScreen/view"], function (FullScreenView) {
                    new FullScreenView();
                });
            }
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            $(".navbar").after(this.$el);
        }
    });

    return ControlsView;
});
