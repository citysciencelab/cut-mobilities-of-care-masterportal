define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/zoom/template.html",
    "eventbus"
], function (Backbone, Radio, ZoomControlTemplate, EventBus) {

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
        show: function() { this.$el.show(); },
        hide: function() { this.$el.hide(); }
    });

    return ZoomControlView;
});
