define([
    "backbone",
    "backbone.radio",
    "config"
], function (Backbone, Radio, Config) {

    var ToggleControlView = Backbone.View.extend({
        className: "row",
        template: _.template("<div class='toggleButton col-md-1' title='Menü ausblenden'><span class='glyphicon glyphicon-chevron-up'></span></div>"),
        events: {
            "click .glyphicon-chevron-up, .glyphicon-chevron-down": "toggleNavigation"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template);
            if (Config.isMenubarVisible === false) {
                this.toggleNavigation();
            }
        },
        toggleNavigation: function () {
            var mapHeight;

            $(".toggleButton > span").toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
            $("#main-nav").toggle();
            if ($("#main-nav").css("display") === "none") {
                mapHeight = $(".lgv-container").height();
            }
            else {
                mapHeight = $(".lgv-container").height() - $("#main-nav").height();
            }
            $("#map").css("height", mapHeight + "px");
            Radio.trigger("Map", "updateSize");
        }
    });

    return ToggleControlView;
});
