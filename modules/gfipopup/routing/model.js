define([
    "backbone",
    "eventbus",
    "underscore",
    "config"
], function (Backbone, EventBus, _, Config) {

    var RoutingModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
        },
        /**
         *
         */
        initialize: function () {
            this.set('id', _.uniqueId("routenbutton"));
        },
        destroy: function () {
            this.unbind();
            this.clear({silent:true});
        }
    });
    return RoutingModel;
});
