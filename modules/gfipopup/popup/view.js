define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        GFIPopupTemplate = require("text!modules/gfipopup/popup/template.html"),
        GFIPopup = require("modules/gfipopup/popup/model"),
        EventBus = require("eventbus"),
        Config = require("config"),
        GFIPopupView;

    GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        backupGFI: {},
        events: {
            "click .gfi-close": "destroy",
            "click .gfi-toggle": "minMaximizePop",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function () {
            var channel = Radio.channel("GFIPopup");

            channel.on({
                "closeGFIParams": this.destroy
            }, this);

            $("#popovermin").remove();
            this.listenTo(this.model, "change:coordinate", this.render);
            EventBus.on("gfipopup:rerender", this.rerender, this);
            EventBus.on("closeGFIParams", this.destroy, this); // trigger in map.js
            EventBus.on("showGFIParams", this.minMaximizePop, this);
            EventBus.trigger("mapHandler:showMarker", [0,0]);
            if (_.has(Config, "gfiWindow")) {
                this.gfiWindow = Config.gfiWindow;
            }
            else {
                this.gfiWindow = "detached";
            }

        },
        /**
         * Toggle des Popovers in minimiert oder maximiert
         */
        minMaximizePop: function () {
            var overlay = this.model.get("gfiOverlay"),
                html;

            if (overlay.getPosition() === undefined) {
                $(".gfi-win").show();
                overlay.setPosition(this.model.get("coordinate"));
                $("#popovermin").fadeOut(500, function () {
                    $("#popovermin").remove();
                });
            }
            else {
                overlay.setPosition(undefined);
                $(".gfi-win").hide();
                html = "<div id='popovermin' class='popover-min'>";
                html += "<span class='glyphicon glyphicon-info-sign gfi-icon'></span>";
                html += "<span class='gfi-title'>Informationen</span>";
                html += "</div>";
                $("#map").append(html);
                $("#popovermin").fadeIn(500);
                $("#popovermin").click(function () {
                    EventBus.trigger("showGFIParams", this);
                });
            }
        },
        /*
         * Zeichnet Popup mit vorhandenem content neu
         */
        rerender: function () {
            $(this.model.get("element")).popover({
                placement: function () {
                    if (this.getPosition().top > window.innerHeight / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                },
                html: true,
                content: this.$el.find(".gfi-content")
            });
            this.model.showPopup();
        },
        /**
         *
         */
        render: function (evt) {
            var coord = [],
                attr = this.model.toJSON();

            if (this.gfiWindow !== "attached") {
                if (_.has(evt, "changed")) {
                    coord = evt.changed.coordinate;
                    if (coord !== this.coordinate) {
                        this.coordinate = coord;
                        EventBus.trigger("mapHandler:showMarker", coord);
                    }
                }
            }

            if (this.gfiWindow !== "attached") {
                this.$el.attr("class", "gfi-win");
                $("body").append(this.$el.html(this.template(attr)));
                $(".gfi-content").css("max-height", ($(window).height() * 0.7));
            }
            else {
                this.$el.html(this.template(attr));
            }

            this.$el.find(".gfi-content").append(this.model.get("gfiContent")[this.model.get("gfiCounter") - 1].$el.clone(true));
            this.$el.find(".gfi-title").text(this.model.get("gfiTitles")[this.model.get("gfiCounter") - 1]);
            $(this.model.get("element")).popover({
                placement: function () {
                    if (this.getPosition().top > window.innerHeight / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                },
                html: true,
                content: this.$el
            });

            if (this.gfiWindow !== "attached") {
                this.$el.draggable({
                    containment: "#map",
                    handle: ".gfi-header"
                });
                $(".gfi-win").show();
            }
            else {
                this.model.showPopup();
                EventBus.trigger("closeMouseHoverPopup", this);
                EventBus.trigger("GFIPopupVisibility", true);
            }
        },
        /**
         *
         */
        renderNext: function () {
            if ($(".pager-right").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") - 1);
                this.render();
            }
        },
        /**
         *
         */
        renderPrevious: function () {
            if ($(".pager-left").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") + 1);
                this.render();
            }
        },
        /**
         *
         */
        destroy: function () {
            $(".gfi-win").hide();
            EventBus.trigger("mapHandler:showMarker", [0,0]);
            this.removeTemplateModels();
            $("#popovermin").remove();
            this.model.destroyPopup();
            EventBus.trigger("GFIPopupVisibility", false);
        },
        /**
         *
         */
        removeTemplateModels: function () {
            this.model.removeChildObjects();
        }
    });

    return GFIPopupView;
});
