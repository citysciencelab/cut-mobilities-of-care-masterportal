define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        FullScreenView;

    FullScreenView = Backbone.View.extend({
        className: "row",
        template: _.template("<div class='full-screen-button' title='Vollbild aktivieren'><span class='glyphicon glyphicon-fullscreen'></span></div>"),
        events: {
            "click .full-screen-button": "toggleFullScreen"
        },
        initialize: function () {
            $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", this.toggleStyle);
            this.render();
        },
        render: function () {
            this.$el.html(this.template);
        },
        toggleFullScreen: function () {
            // true wenn "window" keine iframe ist --> FullScree-Modus (F11)
            if (window.self === window.top) {
                if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    if (document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen();
                    }
                    else if (document.documentElement.msRequestFullscreen) {
                      document.documentElement.msRequestFullscreen();
                    }
                    else if (document.documentElement.mozRequestFullScreen) {
                      document.documentElement.mozRequestFullScreen();
                    }
                    else if (document.documentElement.webkitRequestFullscreen) {
                      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                }
                else {
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    }
                    else if (document.msExitFullscreen) {
                      document.msExitFullscreen();
                    }
                    else if (document.mozCancelFullScreen) {
                      document.mozCancelFullScreen();
                    }
                    else if (document.webkitExitFullscreen) {
                      document.webkitExitFullscreen();
                    }
                }
            }
            // wenn "window" ein iframe ist --> Weiterleitung auf geoportale-hamburg.de
            else {
                window.open(window.location.href, "_blank");
            }
        },
        toggleStyle: function () {
            $(".full-screen-button > span").toggleClass("glyphicon-fullscreen glyphicon-remove");
            if ($(".full-screen-button").attr("title") === "Vollbild aktivieren") {
                $(".full-screen-button").attr("title", "Vollbild deaktivieren");
            }
            else {
                $(".full-screen-button").attr("title", "Vollbild aktivieren");
            }
        }
    });

    return FullScreenView;
});
