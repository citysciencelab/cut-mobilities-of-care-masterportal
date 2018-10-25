const Sidebar = Backbone.Model.extend({
    defaults: {
        // true if sidebar is visible
        isVisible: false,
        // true if viewport width < 768px
        isMobile: false
    },
    initialize: function () {
        var channel = Radio.channel("Sidebar");

        this.listenTo(channel, {
            "toggle": this.setIsVisible,
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

    setIsVisible: function (value) {
        this.set("isVisible", value);
    }
});

export default Sidebar;
