define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var Window = Backbone.Model.extend({
        defaults: {
            isCollapsed: false,
            isVisible: false,
            maxPosLeft: "",
            maxPosTop: "50px"
        },
        initialize: function () {
            var channel = Radio.channel("Window");

            channel.on({
                "toggleWin": this.setParams,
                "closeWin": this.setIsVisible,
                "collapseWin": this.collapseWindow,
                "uncollapseWin": this.uncollapseWindow
            }, this);
        },
        collapseWindow: function () {
            this.setCollapse(true);
        },
        uncollapseWindow: function () {
            this.setCollapse(false);
        },
        setCollapse: function (value) {
            this.set("isCollapsed", value);
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
            if (!value) {
                this.setCollapse(value);
            }
        },
        setParams: function (value) {
            this.setTool(value);
            this.set("title", value.get("name"));
            this.set("icon", value.get("glyphicon"));
            this.set("winType", value.get("id"));
            if (value.get("id") === "gfi") {
                this.set("isVisible", false);
            }
            else {
                this.set("isVisible", true);
            }
        },
        sendParamsToWinCotent: function () {
            Radio.trigger("Window", "winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("tool")]);
        },
        setTool: function (value) {
            this.set("tool", value);
        }
    });

    return new Window();
});
