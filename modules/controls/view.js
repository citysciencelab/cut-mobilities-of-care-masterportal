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
//            if (_.has(Config.controls, "orientation") === true && Config.controls.orientation === true) {
//                require(["modules/controls/orientation/view"], function (OrientationView) {
//                    new OrientationView();
//                });
//            }
//            if (_.has(Config.controls, "poi") === true && Config.controls.poi === true) {
//                require(["views/PointOfInterestView", "views/PointOfInterestListView"], function (PointOfInterestView, PointOfInterestListView) {
//                    // new PointOfInterestView();
//                    new PointOfInterestListView();
//                });
//            }
        },
        render: function () {
            $(".navbar").after(this.$el);
        }
    });

    return ControlsView;
});
