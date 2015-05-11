define([
    "underscore",
    "backbone",
    "config",
    "eventbus"
], function (_, Backbone, Config, EventBus) {

        var Tree = Backbone.Model.extend({
            defaults: {
                topicList: ["Opendata", "Inspire"],
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
                    Config.tree.layerAttribute = "kategorieOpendata";
                }
                else {
                    Config.tree.layerAttribute = "kategorieInspire";
                }
                EventBus.trigger("fetchTreeList", this.get("currentSelection"));
            }
        });
        return Tree;
    });
