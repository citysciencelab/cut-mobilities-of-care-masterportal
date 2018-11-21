/**
 * @description Model for Routing-Button in GFI
 * @module RoutingButton
 * @extends Backbone.Model
 */
const RoutingButton = Backbone.Model.extend({
    defaults: {},
    setRoutingDestination: function () {
        var routingTool = Radio.request("ModelList", "getModelByAttributes", {id: "routing"});

        routingTool.setIsActive(true);
        Radio.trigger("ViomRouting", "setRoutingDestination", Radio.request("GFI", "getCoordinate"));
    }
});

export default RoutingButton;
