import ZoomControlTemplate from "text-loader!./template.html";

const ZoomControlView = Backbone.View.extend({
    events: {
        "click .glyphicon-plus": "setZoomLevelUp",
        "click .glyphicon-minus": "setZoomLevelDown"
    },
    initialize: function () {
        this.render();
    },
    template: _.template(ZoomControlTemplate),
    render: function () {
        this.$el.html(this.template);
        return this;
    },
    setZoomLevelUp: function () {
        Radio.trigger("MapView", "setZoomLevelUp");
        Radio.trigger("ClickCounter", "zoomChanged");
    },
    setZoomLevelDown: function () {
        Radio.trigger("MapView", "setZoomLevelDown");
        Radio.trigger("ClickCounter", "zoomChanged");
    }
});

export default ZoomControlView;
