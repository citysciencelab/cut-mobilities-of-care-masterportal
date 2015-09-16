define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var RoutableModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            coordinate: ""
        },
        /**
         *
         */
        initialize: function (coord) {
            this.set("id", _.uniqueId("routableButton"));
            this.set("coordinate", coord);
        },
        setRoutingDestination: function () {
            EventBus.trigger("setRoutingDestination", this.get("coordinate"));
        },
        destroy: function () {
            this.unbind();
            this.clear({silent: true});
        }
    });
    return RoutableModel;
});
