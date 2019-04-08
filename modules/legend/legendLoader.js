import MobileLegend from "./mobile/view";
import DesktopLegend from "./desktop/view";
/**
 * @member ContentTemplate
 * @description Template of legend content identical for mobile and desktop view
 * @memberof Legend
 */
const LegendLoader = Backbone.Model.extend(/** @lends LegendLoader.prototype */{
    defaults: {
        currentLegend: ""
    },
    /**
     * @class LegendLoader
     * @extends Backbone.Model
     * @memberof Legend
     * @constructs
     * @property {String} currentLegend currently visible legend,
     * @param {*} LegendModel todo
     * @listens Util#RadioTriggerUtilIsViewMobileChanged
     * @fires Util#RadioRequestUtilIsViewMobile
     */
    initialize: function (LegendModel) {
        this.loadMenu(LegendModel);

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentLegend.removeView();
                this.loadMenu(LegendModel);
            }
        }, this);
    },
    /**
    * todo
    * @param {*} LegendModel todo
    * @fires Util#RadioRequestUtilIsViewMobile
    * @returns {void}
    */
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
