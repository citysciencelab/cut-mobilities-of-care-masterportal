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
     * @property {Boolean} isVisible=false Flag if sidebar is visible
     * @property {Boolean} isMobile=false Flag if sidebar is mobile
     * @listens Sidebar#RadioTriggerSidebarToggle
     * @listens Sidebar#RadioTriggerSidebarAppend
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires Sidebar#addContent
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("Sidebar");

        this.listenTo(channel, {
            "toggle": this.toggle,
            "append": this.addContent,
            "resize": this.resize
        });
        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.setIsMobile
        });
        this.setIsMobile(Radio.request("Util", "isViewMobile"));
    },

    /**
     * passes a DOM element to the view
     * @param {DOM} element - from a tool view
     * @param {boolean} dragable - is the sidebar resizeable? default = false
     * @returns {void}
     * @fires Sidebar#addContent
     */
    addContent: function (element, dragable = false) {
        this.trigger("addContent", element, dragable);
        Radio.trigger("Sidebar", "updated", $(element).attr("class"));
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
     * @param {String} width Width for sidebar
     * @fires Sidebar#setWidth
     * @returns {void}
     */
    toggle: function (isVisible, width) {
        if (!this.get("isMobile")) {
            if (width !== undefined) {
                this.setWidth(width);
            }
            else {
                this.setWidth("30%");
            }
        }
        else {
            this.setWidth("100%");
        }
        this.trigger("resize");
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
    },
    /**
     * @description resizes the open window
     * @param {*} width the new width
     * @return {void}
     */
    resize: function (width) {
        if (width !== undefined) {
            this.setWidth(width);
        }

        this.trigger("resize");
    }
});

export default SidebarModel;
