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
        $("#masterportal-container").append(this.$el);
        return this;
    },
    closeSelfAndLayertree: function () {
        const channel = Radio.channel("TableMenu");

        channel.trigger("hideCurrentElement");
    }
});

export default CloseClickView;
