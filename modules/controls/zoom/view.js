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
        },
        render: function () {
            this.$el.html(this.template);
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
