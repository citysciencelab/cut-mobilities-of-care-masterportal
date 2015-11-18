define([
    "backbone",
    "config",
    "eventbus"
], function (Backbone, Config, EventBus) {

        var Tree = Backbone.Model.extend({
            defaults: {
                topicList: ["Opendata", "Inspire"], // --> Config
                currentSelection: Config.tree.orderBy,
                type: Config.tree.type
            },
            initialize: function () {
                this.listenTo(EventBus, {
                    "mapView:sendCenterAndZoom": function (center, zoom) {
                        EventBus.trigger("layerselectionlist:createParamsForURL", center, zoom);
                    }
                });
                this.listenTo(this, "change:currentSelection", this.sendSelection);
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
