define([
    "backbone",
    "config",
    "modules/window/model",
    "text!modules/window/templateMax.html",
    "text!modules/window/templateMin.html",
    "eventbus",
    "jqueryui/draggable"
], function (Backbone, Config, Window, templateMax, templateMin, EventBus) {

    var WindowView = Backbone.View.extend({
        id: "window",
        className: "win-max ui-widget-content",
        model: Window,
        templateMax: _.template(templateMax),
        templateMin: _.template(templateMin),
        initialize: function () {
            this.model.on("change:isVisible change:isCollapsed change:winType", this.render, this);
            this.$el.draggable({
                containment: "#map",
                handle: ".win-heading"
            });
            this.$el.css({
                "max-height": window.innerHeight - 100 // 100 fixer Wert für navbar &co.
            });
            $(window).resize($.proxy(function () {
                this.$el.css({
                    "max-height": window.innerHeight - 100 // 100 fixer Wert für navbar &co.
                });
            }, this));
        },
        events: {
            "click .win-minimize": "minimize",
            "click .win-maximze": "maximize",
            "click .win-close": "hide"
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isVisible") === true) {
                if (this.model.get("isCollapsed") === true) {
                    $("body").append(this.$el.html(this.templateMin(attr)));
                    this.$el.addClass("win-min");
                    this.$el.removeClass("win-max");
                }
                else {
                    $("body").append(this.$el.html(this.templateMax(attr)));
                    this.$el.addClass("win-max");
                    this.$el.removeClass("win-min");
                }
                this.model.sendParamsToWinCotent();
                this.$el.show("slow");
            }
            else {
                this.$el.hide("slow");
            }
        },
        minimize: function () {
            this.$el.addClass("win-min");
            this.$el.removeClass("win-max");
            this.model.setCollapse(true);
        },
        maximize: function () {
            this.model.setCollapse(false);
            this.$el.addClass("win-max");
            this.$el.removeClass("win-min");
        },
        hide: function () {
            if (this.model.get("winType") === "routing") {
                EventBus.trigger("deleteRoute", this);
            }
            this.$el.hide("slow");
            this.model.setVisible(false);
            this.model.sendParamsToWinCotent();
            EventBus.trigger("onlyActivateGFI");
        }
    });

    return WindowView;
    });
