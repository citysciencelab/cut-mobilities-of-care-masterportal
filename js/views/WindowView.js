define([
    "underscore",
    "backbone",
    "config",
    "models/Window",
    "text!templates/Window.html",
    "eventbus",
    "jqueryui/draggable"
], function (_, Backbone, Config, Window, WindowTemplate, EventBus) {

        var WindowView = Backbone.View.extend({
            id: "window",
            className: "win-max ui-widget-content",
            model: Window,
            template: _.template(WindowTemplate),
            initialize: function () {
                this.model.on("change:isVisible change:isCollapsed change:winType", this.render, this);
                // console.log(this.$el);
                this.$el.draggable({
                    containment: "#map"
                });
            },
            events: {
                "click .win-minimize": "minimize",
                "click .win-maximze": "maximize",
                "click .win-close": "hide"
            },
            render: function () {
                var attr = this.model.toJSON();
                if (this.model.get("isVisible") === true) {
                    $("#toggleRow").append(this.$el.html(this.template(attr)));
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
