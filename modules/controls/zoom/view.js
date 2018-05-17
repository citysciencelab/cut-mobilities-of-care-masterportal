define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/zoom/template.html"
], function (Backbone, Radio, ZoomControlTemplate) {

    var ZoomControlView = Backbone.View.extend({
        template: _.template(ZoomControlTemplate),
        events: {
            "click .glyphicon-plus": "setZoomLevelUp",
            "click .glyphicon-minus": "setZoomLevelDown"
        },
        initialize: function () {
            this.render();
            if (!Radio.request("Map", "isMap3d")) {
                this.show();
            }
            var channel = Radio.channel("Map");
            channel.on({
                "activateMap3d": this.hide,
                "deactivateMap3d": this.show
            }, this);
        },
        render: function () {
            this.$el.html(this.template);
            this.hide();
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
