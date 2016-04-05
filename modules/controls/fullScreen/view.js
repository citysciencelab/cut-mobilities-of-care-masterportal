define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        FullScreenView;

    FullScreenView = Backbone.View.extend({
        className: "row",
        template: _.template("<div class='full-screen-button col-md-1' title='Karte vergrößern'><span class='glyphicon glyphicon-fullscreen'></span></div>"),
        events: {
            "click .glyphicon-resize-full": "setZoomLevelUp"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            $(".controls-view").append(this.$el.html(this.template));
        }
    });

    return FullScreenView;
});
