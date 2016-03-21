define([
    "backbone",
    "config",
    "eventbus"
], function (Backbone, Config, EventBus) {

        var Tree = Backbone.Model.extend({
            defaults: {
                topicList: ["Opendata", "Inspire"], // --> Config
                currentSelection: Config.tree.orderBy,
                type: Config.tree.type,
                quickHelp: false,
                saveSelection: false,
                defaultBackground: "" // wird beim Umschalten der Hintergrundfarbe gefüllt
            },
            initialize: function () {
                this.listenTo(this, "change:currentSelection", this.sendSelection);

                if (_.has(Config, "quickHelp") && Config.quickHelp === true) {
                    this.set("quickHelp", true);
                }

                if (_.has(Config.tree, "saveSelection") && Config.tree.saveSelection === true) {
                    this.set("saveSelection", true);
                }
            },
            setSelection: function (value) {
                this.set("currentSelection", value.toLowerCase());
            },
            sendSelection: function () {
                Config.tree.orderBy = this.get("currentSelection");
                EventBus.trigger("layerlist:fetchLayer");
            }
        });

        return Tree;
    });
