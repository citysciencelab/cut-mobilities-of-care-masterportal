define([
    "backbone",
    "text!modules/controls/zoom/template.html",
    "eventbus"
], function (Backbone, ZoomControlTemplate, EventBus) {

    var ZoomControlView = Backbone.View.extend({
        className: "row",
        template: _.template(ZoomControlTemplate),
        events: {
            "click .glyphicon-plus": "setZoomLevelUp",
            "click .glyphicon-minus": "setZoomLevelDown"
        },
        initialize: function () {
            this.render();
            EventBus.trigger("registerZoomButtonsInClickCounter", this.$el);
        },
        render: function () {
            $(".controls-view").append(this.$el.html(this.template));
        },
        setZoomLevelUp: function () {
            EventBus.trigger("mapView:setZoomLevelUp");
        },
        setZoomLevelDown: function () {
            EventBus.trigger("mapView:setZoomLevelDown");
        }
    });

    return ZoomControlView;
});
