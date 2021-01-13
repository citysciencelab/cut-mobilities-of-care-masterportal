const SidebarModel = Backbone.Model.extend(/** @lends SidebarModel.prototype */{
    defaults: {
        // true if sidebar is visible
        isVisible: false,
        // true if viewport width < 768px
        isMobile: false,
        width: "auto"
    },
    /**
     * @class SidebarModel
     * @extends Backbone.Model
     * @memberof Sidebar
     * @property {Boolean} isVisible=false Flag if sidebar is visible
     * @property {Boolean} isMobile=false Flag if sidebar is mobile
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Core#RadioRequestUtilIsViewMobile
     * @constructs
     */
    initialize: function () {
        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.setIsMobile
        });
        this.setIsMobile(Radio.request("Util", "isViewMobile"));
    },
    /**
     * Setter for "isMobile".
     * @param {Boolean} value Flag if sidebar is mobile.
     * @returns{void}
     */
    setIsMobile: function (value) {
        this.set("isMobile", value);
    },
    /**
     * Setter for "isVisible".
     * @param {Boolean} value Flag if sidebar is visible.
     * @returns{void}
     */
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },
    /**
     * Setter for "width".
     * @param {string} value width of sidebar.
     * @returns{void}
     */
    setWidth: function (value = "auto") {
        let res = parseFloat(value, 10);

        if (isNaN(res)) {
            res = "auto";
        }
        if (res <= 1) {
            res = Math.round(res * window.innerWidth) + "px";
        }
        else {
            res = Math.round(res) + "px";
        }

        this.set("width", res);
    }
});

export default SidebarModel;
