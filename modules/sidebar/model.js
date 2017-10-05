define(function () {

    var Sidebar = Backbone.Model.extend({
        defaults: {
            // true if sidebar is visible
            isVisible: false,
            // true if viewport width < 768px
            isMobile: false
        },
        initialize: function () {
            var channel = Radio.channel("Sidebar");

            this.listenTo(channel, {
                "toggle": this.setIsVisible
            });
            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.setIsMobile
            });
            this.setIsMobile(Radio.request("Util", "isViewMobile"));
        },

        /**
         * sets the isMobile attribute
         * @param  {boolean} value
         */
        setIsMobile: function (value) {
            this.set("isMobile", value);
        },

        /**
         * sets the isVisible attribute
         * @param  {boolean} value
         */
        setIsVisible: function (value) {
            this.set("isVisible", value);
        }
    });

    return Sidebar;
});
