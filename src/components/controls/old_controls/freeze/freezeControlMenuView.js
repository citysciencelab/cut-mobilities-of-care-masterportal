const FreezeControlViewMenu = Backbone.View.extend({
    events: {
        "click .freeze-view-start": "toggleFreezeWindow"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.freezeText || changed.unfreezeText || changed.name || changed.glyphicon) {
                    this.renderAsControl();
                }
            }
        });
        this.renderAsControl();
    },
    collection: {},
    id: "freeze-view-control",
    className: "freeze-view-start",
    template: _.template("<div class='freeze-view-start' title='<%= freezeText %>'><span class='glyphicon icon-lock lock-control'></span></div>"),
    renderAsControl: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
    },
    toggleFreezeWindow: function () {
        this.model.startFreezeWin();
    }
});

export default FreezeControlViewMenu;
