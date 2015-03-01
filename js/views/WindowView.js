define([
    "underscore",
    "backbone",
    "config",
    "eventbus",
    "models/Window",
    "text!../../templates/Window.html"
    ], function (_, Backbone, Config, EventBus, Window, WindowTemplate) {

        var WindowView = Backbone.View.extend({
            id: "window",
            className: "win-max",
            model: Window,
            template: _.template(WindowTemplate),
            initialize: function () {
                this.model.on("change:isVisible change:isCollapsed change:winType", this.render, this);
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
                this.$el.hide("slow");
                this.model.setVisible(false);
                this.model.sendParamsToWinCotent();
            }
        });

        return WindowView;
    });
