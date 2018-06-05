define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        FullScreenView;

    FullScreenView = Backbone.View.extend({
        className: "row",
        template: _.template("<div class='full-screen-button' title='Vollbild aktivieren'><span class='glyphicon glyphicon-fullscreen'></span></div>"),
        tabletemplate: _.template("<div class='full-screen-view'><span class='glyphicon icon-fullscreen'></span></br>Vollbild umschalten</div>"),
        events: {
            //"click div.full-screen-button": "toggleFullScreen",
            "click div.full-screen-view": "toggleFullScreen"
        },
        initialize: function () {
            var style = Radio.request("Util", "getUiStyle"),
                el;
            //$(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", this.toggleStyle);
            //this.render();
            if (style === "DEFAULT") {
                el = Radio.request("ControlsView", "addRowTR", "toggleStyle");
                this.setElement(el[0]);
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
            this.$el.prepend(this.tabletemplate());
            //$(this.$el).html(this.tabletemplate({name: "Vollbild umschalten", glyphicon: "icon-fullscreen"}));
            //(this.$el).children().last().addClass("full-screen-view");
            //$("#table-tools-menu").append(this.$el);
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
        /*toggleStyle: function () {
            $(".full-screen-button > span").toggleClass("glyphicon-fullscreen glyphicon-remove");
            if ($(".full-screen-button").attr("title") === "Vollbild aktivieren") {
                $(".full-screen-button").attr("title", "Vollbild deaktivieren");
            }
            else {
                $(".full-screen-button").attr("title", "Vollbild aktivieren");
            }*/
         toggleStyle: function () {
            $(".full-screen-view > span").toggleClass("glyphicon-fullscreen glyphicon-remove");
            if ($(".full-screen-view").attr("title") === "Vollbild aktivieren") {
                $(".full-screen-view").attr("title", "Vollbild deaktivieren");
            }
            else {
                $(".full-screen-view").attr("title", "Vollbild aktivieren");
            }
        }
    });

    return FullScreenView;
});
