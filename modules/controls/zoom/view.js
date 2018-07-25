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
            this.render();
        },
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

    return ZoomControlView;
});
