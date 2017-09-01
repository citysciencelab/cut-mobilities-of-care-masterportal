define(function (require) {

    var Model = require("modules/sidebar/model"),
        SidebarView;

    SidebarView = Backbone.View.extend({
        model: new Model(),
        className: "sidebar",
        initialize: function () {
            this.listenTo(this.model, {
                "change:isOpen": this.toggle
            });
        },
        toggle: function (model, isOpen) {
            if (isOpen) {
                this.render();
            }
            else {
                this.removeView();
            }
        },
        removeView: function () {
            this.$el.remove();
            $("#map").css("width", "100%");
        },
        render: function () {
            var mapHeight = $("#map").height();

            $("#map").css("width", "70%");
            $("#map").after(this.$el);
            $(".sidebar").css("height", mapHeight + "px");
        },
        closeSidebar: function () {
            this.model.setIsOpen(false);
        }
    });
    return SidebarView;
});
