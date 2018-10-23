define(function (require) {
    var ZoomControlTemplate = require("text!modules/controls/zoom/template.html"),
        ZoomControlView;

    ZoomControlView = Backbone.View.extend({
        template: _.template(ZoomControlTemplate),
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
        render: function () {
            this.$el.html(this.template);
            this.$el.hide();
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

    return ZoomControlView;
});
