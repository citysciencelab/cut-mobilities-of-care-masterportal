const SidebarModel = Backbone.Model.extend({
    defaults: {
        // true if sidebar is visible
        isVisible: false,
        // true if viewport width < 768px
        isMobile: false,
        width: "30%"
    },
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
     */
    addContent: function (element) {
        this.trigger("addContent", element);
    },

    setIsMobile: function (value) {
        this.set("isMobile", value);
    },
    toggle: function (isVisible, width) {
        if (width !== undefined) {
            this.setWidth(width);
        }
        this.setIsVisible(isVisible);
    },
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },
    setWidth: function (value) {
        this.set("width", value);
    }
});

export default SidebarModel;
