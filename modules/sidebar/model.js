define(function () {

    var Sidebar = Backbone.Model.extend({
        defaults: {
            // true if sidebar is visible
            isVisible: false,
            // true if viewport width < 768px
            isMobile: false,
            renderElement: null,
            toolName: ""
        },
        initialize: function () {
            var channel = Radio.channel("Sidebar");

            this.listenTo(channel, {
                "toggle": this.setIsVisible,
                "append": this.append
            });
            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.setIsMobile
            });
            this.setIsMobile(Radio.request("Util", "isViewMobile"));
        },
        append: function (name, element) {
            if (this.getToolName() !== name) {
                this.setRenderElement(element);
                this.setToolName(name);
                this.trigger("render");
            }
        },

        setIsMobile: function (value) {
            this.set("isMobile", value);
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getRenderElement: function () {
            return this.get("renderElement");
        },
        setRenderElement: function (value) {
            this.set("renderElement", value);
        },
        getToolName: function () {
            return this.get("toolName");
        },
        setToolName: function (value) {
            this.set("toolName", value);
        }
    });

    return Sidebar;
});
