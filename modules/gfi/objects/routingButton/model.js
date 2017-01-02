define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        RoutingButton;

    RoutingButton = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            coordinate: undefined
        },
        /**
         *
         */
        initialize: function () {
            this.setCoordinate(Radio.request("GFI", "getCoordinate"));
        },
        setRoutingDestination: function () {
            var routingTool = Radio.request("ModelList", "getModelByAttributes", {id: "routing"});

            routingTool.setIsActive(true);
            Radio.trigger("Routing", "setRoutingDestination", this.getCoordinate());
        },

        setCoordinate: function (value) {
            this.set("coordinate", value);
        },

        getCoordinate: function () {
            return this.get("coordinate");
        }
    });
    return RoutingButton;
});
