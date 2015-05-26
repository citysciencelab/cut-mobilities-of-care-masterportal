define([
    "backbone",
    "config",
    "eventbus"
], function (Backbone, Config, EventBus) {

        var Tree = Backbone.Model.extend({
            defaults: {
                topicList: ["Opendata", "Inspire", "Olympia"], // --> Config
                currentSelection: Config.tree.orderBy
            },
            initialize: function () {
                this.listenTo(this, "change:currentSelection", this.sendSelection);
            },
            setSelection: function (value) {
                this.set("currentSelection", value.toLowerCase());
            },
            sendSelection: function () {
                Config.tree.orderBy = this.get("currentSelection");
                if (this.get("currentSelection") === "opendata") {
                    EventBus.trigger("getOpendataFolder");
                }
                else if (this.get("currentSelection") === "inspire") {
                    EventBus.trigger("getInspireFolder");
                }
                else {
                    EventBus.trigger("getCustomNodes");
                }
            }
        });

        return Tree;
    });
