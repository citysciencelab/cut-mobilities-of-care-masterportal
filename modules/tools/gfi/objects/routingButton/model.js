define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        RoutingButton;

    RoutingButton = Backbone.Model.extend({
        setRoutingDestination: function () {
            var routingTool = Radio.request("ModelList", "getModelByAttributes", {id: "routing"});

            routingTool.setIsActive(true);
            Radio.trigger("ViomRouting", "setRoutingDestination", Radio.request("GFI", "getCoordinate"));
        }
    });
    return RoutingButton;
});
