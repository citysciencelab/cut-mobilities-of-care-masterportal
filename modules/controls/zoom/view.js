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
            if (!Radio.request("Map", "isMap3d")) {
                this.show();
            }
            channel.on({
                "activateMap3d": this.hide,
                "deactivateMap3d": this.show
            }, this);
        },
        render: function () {
            this.$el.html(this.template);
            this.hide();
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
        show: function () {
            this.$el.show();
        },
        hide: function () {
            this.$el.hide();
        }
    });

    return ZoomControlView;
});
