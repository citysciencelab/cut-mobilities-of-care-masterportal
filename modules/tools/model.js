define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {

    var Tools = Backbone.Model.extend({
        defaults: {
            isActive: false,
            title: "",
            glyphicon: ""
        },
        initialize: function () {
            this.listenTo(this, {
                 "change:isActive": this.activateTool
            });
        },
        setActiveToTrue: function () {
            this.set("isActive", true);
            this.collection.setActiveToFalse(this);
        },
        activateTool: function () {
            if (this.get("isActive") === true) {
                EventBus.trigger("activateClick", this.get("name"));
                if (this.get("name") !== "gfi" && this.get("name") !== "coord") {
                    EventBus.trigger("toggleWin", [this.get("name"), this.get("title"), this.get("glyphicon")]);
                }
                else {
                    EventBus.trigger("winParams", [false, false, ""]);
                    EventBus.trigger("closeWindow", false);
                }
            }
        }
    });

    return Tools;
});
