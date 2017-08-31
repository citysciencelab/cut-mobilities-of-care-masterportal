define([
    "backbone.radio",
    "modules/legend/mobile/view",
    "modules/legend/desktop/view",
    "modules/legend/model"
], function () {
    var Radio = require("backbone.radio"),
        Model = require("modules/legend/model"),
        LegendLoader;

    LegendLoader = function () {
        this.loadMenu = function (caller) {
            var isMobile = Radio.request("Util", "isViewMobile");

            if (isMobile) {
                require(["modules/legend/mobile/view"], function (Legend) {
                    caller.currentMenu = new Legend(Model);
                });
            }
            else {
                require(["modules/legend/desktop/view"], function (Legend) {
                    caller.currentMenu = new Legend(Model);
                });
            }
        };

        this.currentMenu = this.loadMenu(this);

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentMenu.removeView();

                this.currentMenu = this.loadMenu(this);
            }
        }, this);
    };

    return LegendLoader;
});
