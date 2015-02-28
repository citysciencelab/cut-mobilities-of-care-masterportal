define([
    "underscore",
    "backbone",
    "eventbus"
    ], function (_, Backbone, EventBus) {

        var Window = Backbone.Model.extend({
            defaults: {
                isCollapsed: false,
                isVisible: false
            },
            initialize: function () {
                EventBus.on("toggleWin", this.setParams, this);
            },
            setCollapse: function (value) {
                this.set("isCollapsed", value);
            },
            setVisible: function (value) {
                this.set("isVisible", value)
            },
            setParams: function (args) {
                this.set("title", args[1]);
                this.set("icon", args[2]);
                this.set("winType", args[0]);
                this.set("isVisible", true);
            },
            sendParamsToWinCotent: function () {
                EventBus.trigger("winParams", [this.get("isVisible"), this.get("isCollapsed"), this.get("winType")]);
            }
        });

        return new Window();
    }
);
