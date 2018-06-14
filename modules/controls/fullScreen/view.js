define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        $ = require("jquery"),
        FullScreenView;

    FullScreenView = Backbone.View.extend({
        id: "full-screen-button",
        template: _.template("<div class='full-screen-button' title='Vollbild aktivieren'><span class='glyphicon glyphicon-fullscreen'></span></div>"),
        tabletemplate: _.template("<div id='full-screen-view' class='table-tool'><a href='#'><span class='glyphicon icon-fullscreen'></span> Vollbild umschalten</a> </div>"),
        events: {
            "click .full-screen-button": "toggleFullScreen",
            "click div#full-screen-view": "toggleFullScreen"
        },
        initialize: function () {
            var style = Radio.request("Util", "getUiStyle");
            if (style === "DEFAULT") {
                $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", this.toggleStyle);
                this.render();
            }
            else if (style === "TABLE") {
                this.listenTo(Radio.channel("MenuLoader"), {
                    "ready": function () {
                        this.setElement("#table-tools-menu");
                        this.renderToToolbar();
                    }
                });
                this.setElement("#table-tools-menu");
                this.renderToToolbar();
            }
        },
        render: function () {
            this.$el.html(this.template);
        },
        renderToToolbar: function () {
            this.$el.append(this.tabletemplate);

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
