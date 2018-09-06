define(function (require) {
    var Window = require("modules/window/model"),
        templateMax = require("text!modules/window/templateMax.html"),
        templateTable = require("text!modules/window/templateTable.html"),
        $ = require("jquery"),
        WindowView;

    require("jqueryui/widgets/draggable");

    WindowView = Backbone.View.extend({
        events: {
            "click .glyphicon-minus": "minimize",
            "click .header > .title": "maximize",
            "click .glyphicon-remove": "hide"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisible change:winType": this.render
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
        model: new Window(),
        templateMax: _.template(templateMax),
        templateTable: _.template(templateTable),
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isVisible") === true) {
                if (Radio.request("Util", "getUiStyle") === "TABLE") {
                    $(".lgv-container").append(this.$el.html(this.templateTable(attr)));
                    this.$el.addClass("table-tool-window");
                }
                else {
                    $("body").append(this.$el.html(this.templateMax(attr)));
                    this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
                }
                this.$el.show("slow");
            }
            else {
                this.$el.hide("slow");
            }
            return this;
        },
        minimize: function () {
            this.model.set("maxPosTop", this.$el.css("top"));
            this.model.set("maxPosLeft", this.$el.css("left"));
            this.$(".win-body").hide();
            this.$(".glyphicon-minus").hide();
            this.$el.css({"top": "", "bottom": "0", "left": "0", "margin-bottom": "60px"});
            this.$(".header").addClass("header-min");
            this.$el.draggable("disable");
        },
        maximize: function () {
            if (this.$(".win-body").css("display") === "none") {
                this.$(".win-body").show();
                this.$(".glyphicon-minus").show();
                this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
                this.$(".header").removeClass("header-min");
                this.$el.draggable("enable");
            }
        },
        hide: function () {
            var toolModel = Radio.request("ModelList", "getModelByAttributes", {id: this.model.get("winType")});

            if (toolModel) {
                toolModel.setIsActive(false);
            }
            this.$el.hide("slow");
            this.model.setVisible(false);
        }
    });

    return WindowView;
});
