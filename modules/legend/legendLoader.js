import Model from "./model";
import MobileLegend from "./mobile/view";
import DesktopLegend from "./desktop/view";

function LegendLoader () {
    this.loadMenu = function (caller) {
        var isMobile = Radio.request("Util", "isViewMobile");

        if (isMobile) {
            caller.currentLegend = new MobileLegend(Model);
        }
        else {
            caller.currentLegend = new DesktopLegend(Model);
        }
    };

    this.currentLegend = this.loadMenu(this, false);

    Radio.on("Util", {
        "isViewMobileChanged": function () {
            this.currentLegend.removeView();
            this.currentLegend = this.loadMenu(this);
        }
    }, this);
}

export default LegendLoader;
