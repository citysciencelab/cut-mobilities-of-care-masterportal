const SidebarModel = Backbone.Model.extend(/** @lends SidebarModel.prototype */{
    defaults: {
        // true if sidebar is visible
        isVisible: false,
        // true if viewport width < 768px
        isMobile: false,
        width: "30%"
    },

    /**
     * @class SidebarModel
     * @extends Backbone.Model
     * @memberof Sidebar
     * @param {Boolean} isVisible=false Flag if sidebar is visible
     * @param {Boolean} isMobile=false Flag if sidebar is mobile
     * @param {String} width="30%" Shows the width of the sidebar
     * @listens Sidebar#RadioTriggerSidebarToggle
     * @listens Sidebar#RadioTriggerSidebarAppend
     * @listens Util#RadioTriggerUtilIsViewMobileChanged
     * @fires Util#RadioRequestUtilIsViewMobile
     * @fires Sidebar#addContent
     * @constructs
     */
    initialize: function () {
        var channel = Radio.channel("Sidebar");

        this.listenTo(channel, {
            "toggle": this.toggle,
            "append": this.addContent
        });
        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.setIsMobile
        });
        this.setIsMobile(Radio.request("Util", "isViewMobile"));
    },

    /**
     * passes a DOM element to the view
     * @param {DOM} element - from a tool view
     * @returns {void}
     * @fires Sidebar#addContent
     */
    addContent: function (element) {
        this.trigger("addContent", element);
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
     * Toggles the visibility of the sidebar. Sets the width if not undefined
     * @param {Boolean} isVisible Flag if sidebar is visible.
     * @param {String} width The width of the sidebar in percent. e.g. "30%".
     * @returns {void}
     */
    toggle: function (isVisible, width) {
        if (width !== undefined) {
            this.setWidth(width);
        }
        this.setIsVisible(isVisible);
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
     * @param {String} value The width of the sidebar in percent. e.g. "30%".
     * @returns{void}
     */
    setWidth: function (value) {
        this.set("width", value);
    }
});

export default SidebarModel;
