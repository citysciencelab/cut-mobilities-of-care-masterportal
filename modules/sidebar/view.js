define(function (require) {

    var SidebarModel = require("modules/sidebar/model"),
        $ = require("jquery"),
        SidebarView;

    SidebarView = Backbone.View.extend({
        model: new SidebarModel(),
        className: function () {
            if (this.model.get("isMobile")) {
                return "sidebar-mobile";
            }
            return "sidebar";
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisible": this.toggle,
                "change:isMobile": this.toggleCssClass,
                "render": this.render
            });
        },

        render: function () {
            this.$el.html("");
            $("#map").after(this.$el);
            if (!this.model.get("isMobile")) {
                this.$el.css("height", $("#map").height());
                $("#map").css("width", "70%");
                Radio.trigger("Map", "updateSize");
                this.$el.append(this.model.getRenderElement());
                this.removeBackdrop();
            }
            else {
                this.$el.css("height", "");
                $("#map").css("width", "100%");
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
