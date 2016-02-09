define([
    "backbone",
    "modules/window/model",
    "text!modules/window/templateMax.html",
    "text!modules/window/templateMin.html",
    "eventbus",
    "jqueryui/draggable"
], function (Backbone, Window, templateMax, templateMin, EventBus) {

    var WindowView = Backbone.View.extend({
        id: "window",
        className: "tool-window ui-widget-content",
        model: Window,
        templateMax: _.template(templateMax),
        templateMin: _.template(templateMin),
        initialize: function () {
            this.model.on("change:isVisible change:isCollapsed change:winType", this.render, this);
            this.$el.draggable({
                containment: "#map",
                handle: ".header"
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
            "click .glyphicon-minus": "minimize",
            "click .header-min > .title": "maximize",
            "click .glyphicon-remove": "hide"
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isVisible") === true) {
                if (this.model.get("isCollapsed") === true) {
                    $("body").append(this.$el.html(this.templateMin(attr)));
                    this.$el.css({"top": "", "bottom": "0", "left": "0", "margin-bottom": "60px"});
                }
                else {
                    $("body").append(this.$el.html(this.templateMax(attr)));
                    this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
                }
                this.model.sendParamsToWinCotent();
                this.$el.show("slow");
            }
            else {
                this.$el.hide("slow");
            }
        },
        minimize: function () {
            this.model.set("maxPosTop", this.$el.css("top"));
            this.model.set("maxPosLeft", this.$el.css("left"));
            this.model.setCollapse(true);
        },
        maximize: function () {
            this.model.setCollapse(false);
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
