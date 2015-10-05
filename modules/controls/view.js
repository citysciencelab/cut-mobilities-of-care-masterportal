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
        },
        render: function () {
            $(".navbar").after(this.$el);
        }
    });

    return ControlsView;
});
