define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/controls/orientation/poi/feature/template.html",
    "modules/controls/orientation/poi/feature/model",
    "eventbus"
], function ($, _, Backbone, PointOfInterestTemplate, PointOfInterest, EventBus) {

    var PointOfInterestView = Backbone.View.extend({
        model: PointOfInterest,
        tagName: "tr",
        className: "poiRow",
        template: _.template(PointOfInterestTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },
        events: {
            "click": "onPOIClick"
        },
        onPOIClick: function () {
            this.model.setCenter();
        }

    });

    return PointOfInterestView;
});
