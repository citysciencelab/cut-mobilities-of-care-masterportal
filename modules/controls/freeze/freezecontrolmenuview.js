define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        FreezeControlViewMenu;

    FreezeControlViewMenu = Backbone.View.extend({
        collection: {},
        id: "freeze-view-control",
        className: "freeze-view-start",
        template: _.template("<div class='freeze-view-start' title='Ansicht sperren'><span class='glyphicon icon-lock lock-control'></span></div>"),
        events: {
            "click .freeze-view-start": "toggleFreezeWindow"
        },
        initialize: function () {
            this.renderAsControl();
        },
        renderAsControl: function () {
            this.$el.html(this.template);
        },
        toggleFreezeWindow: function () {
            this.model.startFreezeWin();
        }
    });
        return FreezeControlViewMenu;
});
