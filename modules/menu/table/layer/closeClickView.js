const CloseClickView = Backbone.View.extend({
    events: {
        "click": "closeSelfAndLayertree"
    },
    inizialize: function () {
        this.render();
    },
    id: "closeclick-view",
    className: "closeclick-view closeclick-deactivated",
    render: function () {
        $(".lgv-container").append(this.$el);
        return this;
    },
    closeSelfAndLayertree: function () {
        var channel = Radio.channel("TableMenu");

        channel.trigger("hideMenuElementLayer");
    }
});

export default CloseClickView;