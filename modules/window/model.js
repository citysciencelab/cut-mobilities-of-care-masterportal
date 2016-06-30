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
                EventBus.on("toggleWin", this.setParams, this);
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
            setParams: function (args) {
                if (_.isUndefined(args[3]) === false) {
                    this.set("modelId", args[3]);
                }
                this.set("title", args[1]);
                this.set("icon", args[2]);
                this.set("winType", args[0]);
                this.set("isVisible", true);
            },
            sendParamsToWinCotent: function () {
                if (this.has("modelId")) {
                    Radio.trigger("Window", "winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType"), this.get("modelId")]);
                    EventBus.trigger("winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType"), this.get("modelId")]);
                }
                else {
                    Radio.trigger("Window", "winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType")]);
                    EventBus.trigger("winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType")]);
                }
            }
        });

        return new Window();
    }
);
