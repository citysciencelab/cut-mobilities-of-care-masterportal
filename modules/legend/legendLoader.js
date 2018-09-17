import MobileLegend from "./mobile/view";
import DesktopLegend from "./desktop/view";

const LegendLoader = Backbone.Model.extend({
    defaults: {
        currentLegend: ""
    },
    initialize: function (LegendModel) {
        this.loadMenu(LegendModel);

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentLegend.removeView();
                this.loadMenu(LegendModel);
            }
        }, this);
    },
    loadMenu: function (LegendModel) {
        var isMobile = Radio.request("Util", "isViewMobile");

        if (isMobile) {
            this.currentLegend = new MobileLegend({model: LegendModel});
        }
        else {
            this.currentLegend = new DesktopLegend({model: LegendModel});

        }
    }
});

export default LegendLoader;
