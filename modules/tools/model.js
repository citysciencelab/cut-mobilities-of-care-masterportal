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
        // Setzt das Tool auf aktiviert
        setActiveToTrue: function () {
            this.set("isActive", true);
            this.collection.setActiveToFalse(this);
        },
        // Aktviert das Tool und triggert es an map.js
        // Ggf. wird es noch an window.js getriggert.
        activateTool: function () {
            if (this.get("isActive") === true) {
                EventBus.trigger("activateClick", this.get("name"));
                if (this.get("name") !== "gfi" && this.get("name") !== "coord" && this.get("name") !== "featureLister") {
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
