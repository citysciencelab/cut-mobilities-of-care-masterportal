define(function (require) {
    var Model = require("modules/legend/model"),
        LegendLoader;

    LegendLoader = function () {
        this.loadMenu = function (caller) {
            var isMobile = Radio.request("Util", "isViewMobile");

            if (isMobile) {
                require(["modules/legend/mobile/view"], function (Legend) {
                    caller.currentLegend = new Legend(Model);
                });
            }
            else {
                require(["modules/legend/desktop/view"], function (Legend) {
                    caller.currentLegend = new Legend(Model);
                });
            }
        };

        this.currentLegend = this.loadMenu(this, false);

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentLegend.removeView();
                this.currentLegend = this.loadMenu(this);
            }
        }, this);
    };

    return LegendLoader;
});
