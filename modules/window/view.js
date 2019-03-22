import Window from "./model";
import templateMax from "text-loader!./templateMax.html";
import templateTable from "text-loader!./templateTable.html";
import "jquery-ui/ui/widgets/draggable";

const WindowView = Backbone.View.extend({
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
            start: function (event, ui) {
                // As .draggable works by manipulating the css top and left values the following code is necessary if the bottom and right values
                // are used for the positioning of the tool window (as is the case for the table tool window). Otherwise dragging the window will
                // resize the window if no height and width values are set.
                ui.helper.css({
                    right: "auto",
                    bottom: "auto"
                });
            },
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
        this.render();
    },
    id: "window",
    className: "tool-window ui-widget-content",
    model: new Window(),
    templateMax: _.template(templateMax),
    templateTable: _.template(templateTable),
    render: function () {
        const attr = this.model.toJSON();
        var currentClass,
            currentTableClass;

        if (this.model.get("isVisible") === true) {
            if (Radio.request("Util", "getUiStyle") === "TABLE") {
                this.$el.html(this.templateTable(attr));
                document.getElementsByClassName("lgv-container")[0].appendChild(this.el);
                currentClass = $("#window").attr("class").split(" ");

                _.each(currentClass, function (item) {

                    if (item.startsWith("table-tool-window")) {
                        currentTableClass = item;
                    }
                });

                if ($("#table-nav").attr("class") === "table-nav-0deg ui-draggable" || $("#table-nav").attr("class") === "table-nav-0deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window");
                }
                else if ($("#table-nav").attr("class") === "table-nav-90deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-90deg");
                }
                else if ($("#table-nav").attr("class") === "table-nav-180deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-180deg");
                }
                else if ($("#table-nav").attr("class") === "table-nav-270deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-270deg");
                }
            }
            else {
                this.$el.html(this.templateMax(attr));
                document.body.appendChild(this.el);
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
            Radio.trigger("ModelList", "toggleDefaultTool");
        }
    }
});

export default WindowView;
