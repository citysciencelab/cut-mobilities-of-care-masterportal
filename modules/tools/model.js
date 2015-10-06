define([
    "backbone",
    "eventbus",
    "config"
], function (Backbone, EventBus, Config) {

    var Tools = Backbone.Model.extend({
        initialize: function () {
            _.each(Config.tools, this.setAttributes, this);
            this.listenTo(this, "change:active", this.activateTool);
            EventBus.trigger("activateClick", "gfi");
            EventBus.on("activateGFI", this.activateGFI, this);
            EventBus.on("onlyActivateGFI", this.onlyActivateGFI, this);
        },
        setAttributes: function (value, key) {
            this.set(key, value);
        },
        activateCoordinate: function () {
            this.set("active", "coords");
            EventBus.trigger("closeWindow", false);
        },
        activateMeasure: function () {
            this.set("active", "measure");
        },
        activateDraw: function () {
            this.set("active", "draw");
        },
        activateGFI: function () {
            this.set("active", "gfi");
            EventBus.trigger("closeWindow", false);
        },
        activateTool: function () {
            EventBus.trigger("closeGFIParams", this);
            EventBus.trigger("activateClick", this.get("active"));
        },
        onlyActivateGFI: function () {
            this.set("active", "gfi");
        }
    });

    return new Tools();
});
