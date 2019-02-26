import ZoomControlTemplate from "text-loader!./template.html";

const ZoomControlView = Backbone.View.extend({
    events: {
        "click .glyphicon-plus": "setZoomLevelUp",
        "click .glyphicon-minus": "setZoomLevelDown"
    },
    initialize: function () {
        var channel = Radio.channel("Map");

        this.render();
        this.mapChange(Radio.request("Map", "getMapMode"));
        channel.on({
            "change": this.mapChange
        }, this);
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
    },
    mapChange: function (map) {
        if (map === "2D") {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }
});

export default ZoomControlView;
