define(function (require) {
    var Window = require("modules/window/model"),
        templateMax = require("text!modules/window/templateMax.html"),
        templateMin = require("text!modules/window/templateMin.html"),
        templateTable = require("text!modules/window/templateTable.html"),
        $ = require("jquery"),
        WindowView;

    require("jqueryui/widgets/draggable");

    WindowView = Backbone.View.extend({
        events: {
            "click .glyphicon-minus": "minimize",
            "click .header-min > .title": "maximize",
            "click .glyphicon-remove": "hide"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisible change:isCollapsed change:winType": this.render
            });
            this.$el.draggable({
                containment: "#map",
                handle: ".move",
                stop: function (event, ui) {
                    ui.helper.css({"height": "", "width": ""});
                }
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
        id: "window",
        className: "tool-window ui-widget-content",
        model: Window,
        templateMax: _.template(templateMax),
        templateMin: _.template(templateMin),
        templateTable: _.template(templateTable),
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isVisible") === true) {
                if (Radio.request("Util", "getUiStyle") === "TABLE") {
                    $(".lgv-container").append(this.$el.html(this.templateTable(attr)));
                    this.$el.addClass("table-tool-window");
                }
                else if (this.model.get("isCollapsed") === true) {
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
                this.hide();
            }
            return this;
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
            var toolModel = Radio.request("ModelList", "getModelByAttributes", {id: this.model.get("winType")});

            if (toolModel) {
                toolModel.setIsActive(false);
            }
            if (this.model.get("winType") === "download") {
                Radio.request("ModelList", "getModelByAttributes", {id: "draw"}).setIsActive(false);
            }
            this.$el.hide("slow");
            this.model.setIsVisible(false);
            this.model.sendParamsToWinCotent();
            Radio.channel("Tool").trigger("activatedTool", "gfi", false);
        }
    });

    return WindowView;
});
