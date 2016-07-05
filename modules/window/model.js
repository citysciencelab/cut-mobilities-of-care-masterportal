define([
    "backbone",
    "backbone.radio",
    "config",
    "eventbus"
], function (Backbone, Radio, Config, EventBus) {

        var Window = Backbone.Model.extend({
            defaults: {
                isCollapsed: false,
                isVisible: false,
                maxPosLeft: "",
                maxPosTop: "10px"
            },
            initialize: function () {
                // EventBus.on("toggleWin", this.setParams, this);
                EventBus.on("closeWindow", this.setVisible, this);
                EventBus.on("collapseWindow", this.collapseWindow, this);
                EventBus.on("uncollapseWindow", this.uncollapseWindow, this);
                var channel = Radio.channel("Window");

                channel.on({
                    "toggleWin": this.setParams
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
            setVisible: function (value) {
                this.set("isVisible", value);
            },
            setParams: function (value) {console.log(value);
                this.setTool(value);
                // if (_.isUndefined(args[3]) === false) {
                //     this.set("modelId", args[3]);
                // }
                this.set("title", value.getName());
                this.set("icon", value.getGlyphicon());
                this.set("winType", value.getId());
                this.set("isVisible", true);
            },
            sendParamsToWinCotent: function () {console.log(this);
                Radio.trigger("Window", "winParams", [this.get("isVisible"), this.get("isCollapsed"), this.getTool()]);
                // if (this.has("modelId")) {
                //     Radio.trigger("Window", "winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType"), this.get("modelId")]);
                //     EventBus.trigger("winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType"), this.get("modelId")]);
                // }
                // else {
                //     Radio.trigger("Window", "winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType")]);
                //     EventBus.trigger("winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType")]);
                // }
            },
            setTool: function (value) {
                this.set("tool", value);
            },
            getTool: function () {
                return this.get("tool");
            }
        });

        return new Window();
    }
);
