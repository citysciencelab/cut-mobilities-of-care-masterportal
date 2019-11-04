const Window = Backbone.Model.extend(/** @lends Window.prototype */{
    defaults: {
        isCollapsed: false,
        isVisible: false,
        maxPosLeft: "",
        maxPosTop: "60px",
        rotationAngle: 0
    },

     /**
     * @class Window
     * @description Model for MapMarker and Highlighting
     * @extends Backbone.Model
     * @memberof Window
     * @constructs
     * @listens Window#RadioTriggerWindowSetIsVisible
     * @listens Window#RadioTriggerWindowShowTool
     * @listens Window#RadioTriggerWindowCollapseWin
     */
    initialize: function () {
        var channel = Radio.channel("Window");

        this.listenTo(channel, {
            "setIsVisible": this.setIsVisible,
            "showTool": this.setParams
        }, this);

        channel.on({
            "collapseWin": this.collapseWindow
        }, this);
    },

    /**
     * Collapses the Window
     *  @return {void}
     */
    collapseWindow: function () {
        this.setCollapse(true);
    },

    /**
     * Sets the value for "isCollapsed"
     *  @return {void}
     */
    setCollapse: function (value) {
        this.set("isCollapsed", value);
    },

    /**
     * Sets the value for "isVisible"
     *  @return {void}
     */
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    /**
     * Sets the parameters for the Window
     * @param {Object} value Object containing name, glyphicon and id
     *  @return {void}
     */
    setParams: function (value) {
        this.set("title", value.get("name"));
        this.set("icon", value.get("glyphicon"));
        this.set("winType", value.get("id"));
    }
});

export default Window;
