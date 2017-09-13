define(function (require) {

    var SidebarModel = require("modules/sidebar/model"),
        SidebarView;

    SidebarView = Backbone.View.extend({
        model: new SidebarModel(),
        className: function () {
            if (this.model.get("isMobile")) {
                return "sidebar-mobile";
            }
            else {
                return "sidebar";
            }
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisible": this.toggle,
                "change:isMobile": this.toggleCssClass
            });
            this.render();
        },

        render: function () {
            $("#map").after(this.$el);
            if (!this.model.get("isMobile")) {
                $("#map").css("width", "70%");
                Radio.trigger("Map", "updateSize");
                this.removeBackdrop();
            }
            else {
                this.addBackdrop();
            }
        },

        toggle: function (model, isVisible) {
            if (isVisible) {
                this.render();
            }
            else {
                this.removeView();
                this.removeBackdrop();
            }
        },

        toggleCssClass: function (model, value) {
            if (value) {
                this.$el.removeClass("sidebar");
                this.$el.addClass("sidebar-mobile");
            }
            else {
                this.$el.removeClass("sidebar-mobile");
                this.$el.addClass("sidebar");
            }
            if (this.model.get("isVisible")) {
                this.render();
            }
        },

        removeView: function () {
            this.$el.remove();
            $("#map").css("width", "100%");

            Radio.trigger("Map", "updateSize");
        },

        addBackdrop: function () {
            $(".lgv-container").append("<div class='backdrop'></div>");
        },

        removeBackdrop: function () {
            $(".backdrop").remove();
        }
    });
    return SidebarView;
});
