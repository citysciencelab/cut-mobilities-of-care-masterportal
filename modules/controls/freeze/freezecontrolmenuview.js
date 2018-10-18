const FreezeControlViewMenu = Backbone.View.extend({
    events: {
        "click .freeze-view-start": "toggleFreezeWindow"
    },
    initialize: function () {
        this.renderAsControl();
    },
    collection: {},
    id: "freeze-view-control",
    className: "freeze-view-start",
    template: _.template("<div class='freeze-view-start' title='Ansicht sperren'><span class='glyphicon icon-lock lock-control'></span></div>"),
    renderAsControl: function () {
        this.$el.html(this.template);
    },
    toggleFreezeWindow: function () {
        this.model.startFreezeWin();
    }
});

export default FreezeControlViewMenu;
