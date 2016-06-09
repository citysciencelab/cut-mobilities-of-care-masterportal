define([
    "backbone"
], function (Backbone) {

    var ControlsView = Backbone.View.extend({
        className: "container-fluid controls-view",
        initialize: function () {
            this.render();
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            $(".navbar").after(this.$el);
        }
    });

    return ControlsView;
});
