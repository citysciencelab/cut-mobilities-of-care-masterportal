define(function (require) {
    var LegendLoader;

    LegendLoader = function (LegendModel) {
        this.loadMenu = function (caller) {
            var isMobile = Radio.request("Util", "isViewMobile");

            if (isMobile) {
                require(["modules/legend/mobile/view"], function (Legend) {
                    caller.currentLegend = new Legend({model: LegendModel});
                });
            }
            else {
                require(["modules/legend/desktop/view"], function (Legend) {
                    caller.currentLegend = new Legend({model: LegendModel});
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
