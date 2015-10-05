define([
    "backbone",
    "config"
], function (Backbone, Config) {

    var ToggleControlView = Backbone.View.extend({
        className: "row",
        events: {
            "click .glyphicon-chevron-up, .glyphicon-chevron-down": "toggleNavigation"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            if (Config.isMenubarVisible === true) {
                this.template = "<div class='toggleButton col-md-1'><span class='glyphicon glyphicon-chevron-up glyphicon-up'></span></div>";
            }
            else {
                this.template = "<div class='toggleButton col-md-1'><span class='glyphicon glyphicon-chevron-down glyphicon-down'></span></div>";
            }
            $(".controls-view").append(this.$el.html(this.template));
        },
        toggleNavigation: function () {
            $("#navbarRow").toggle();
            $(".toggleButton > span").toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
            $(".toggleButton > span").toggleClass("glyphicon-up glyphicon-down");
            if ($(".controls-view").css("top") === "0px") {
                $(".controls-view").css("top", "50px");
            }
            else {
                $(".controls-view").css("top", "0px");
            }
        }
    });

    return ToggleControlView;
});
