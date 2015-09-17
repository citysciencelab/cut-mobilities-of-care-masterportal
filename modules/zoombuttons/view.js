define([
    "jquery",
    "underscore",
    "backbone",
    "eventbus"
    ], function ($, _, Backbone, EventBus) {

        var ZoomButtonsView = Backbone.View.extend({
            id: "zoomButtons",
            events: {
                "click .glyphicon-plus": "setZoomLevelUp",
                "click .glyphicon-minus": "setZoomLevelDown"
            },
            initialize: function () {
                this.render();
                EventBus.trigger('registerZoomButtonsInClickCounter', this.$el);
            },
            render: function () {
                this.template = "<span class='glyphicon glyphicon-plus'></span><br><span class='glyphicon glyphicon-minus'></span>";
                $("#toggleRow").append(this.$el.html(this.template));
            },
            setZoomLevelUp: function () {
                EventBus.trigger("setZoomLevelUp");
            },
            setZoomLevelDown: function () {
                EventBus.trigger("setZoomLevelDown");
            }
        });

        return ZoomButtonsView;
    });
