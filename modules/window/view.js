import Window from "./model";
import templateMax from "text-loader!./templateMax.html";
import templateTable from "text-loader!./templateTable.html";
import "jquery-ui/ui/widgets/draggable";

const WindowView = Backbone.View.extend({
    events: {
        "click .glyphicon-minus": "minimize",
        "click .header > .title": "maximize",
        "click .glyphicon-remove": "hide",
        "touchmove .title": "touchMoveWindow",
        "touchstart .title": "touchStartWindow"
    },
    initialize: function () {
        var channel = Radio.channel("WindowView");

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
                "max-height": window.innerHeight - 100, // 100 fixer Wert für navbar &co.
                "overflow": "auto"
            });
        }, this));

        channel.on({
            "hide": this.hide
        }, this);

        this.render();
    },
    id: "window",
    className: "tool-window ui-widget-content",
    model: new Window(),
    templateMax: _.template(templateMax),
    templateTable: _.template(templateTable),
    startX: 0,
    startY: 0,
    windowLeft: 0,
    windowTop:0,
    render: function () {
        const attr = this.model.toJSON();
        var currentClass,
            currentTableClass;

        if (this.model.get("isVisible") === true) {
            if (Radio.request("Util", "getUiStyle") === "TABLE") {
                this.$el.html(this.templateTable(attr));
                document.getElementsByClassName("masterportal-container")[0].appendChild(this.el);
                currentClass = $("#window").attr("class").split(" ");

                this.$el.addClass("table-tool-win-all");

                _.each(currentClass, function (item) {

                    if (item.startsWith("table-tool-window")) {
                        currentTableClass = item;
                    }
                });

                if ($("#table-navigation").attr("class") === "table-nav-0deg ui-draggable" || $("#table-navigation").attr("class") === "table-nav-0deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window");
                    this.model.set("rotationAngle", 0);
                }
                else if ($("#table-navigation").attr("class") === "table-nav-90deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-90deg");
                    this.model.set("rotationAngle", 90);
                }
                else if ($("#table-navigation").attr("class") === "table-nav-180deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-180deg");
                    this.model.set("rotationAngle", 180);
                }
                else if ($("#table-navigation").attr("class") === "table-nav-270deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-270deg");
                    this.model.set("rotationAngle", 270);
                }
            }
            else {
                this.$el.html(this.templateMax(attr));
                document.body.appendChild(this.el);
            }
            this.$el.show("slow");
        }
        else if (this.$(".header").hasClass("header-min")) {
            this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
            this.$el.hide();
        }
        else {
            this.$el.hide("slow");
            console.log("hide")
        }
        return this;
    },
    minimize: function () {
        this.model.set("maxPosTop", this.$el.css("top"));
        this.model.set("maxPosLeft", this.$el.css("left"));
        this.$(".win-body").hide();
        this.$(".glyphicon-minus").hide();
        this.$el.css({"top": "auto", "bottom": "0", "left": "0", "margin-bottom": "60px"});
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
    },
    MoveWindow: function (evt) {
        var touch = evt.originalEvent.touches[0],
            headerWidth = this.$el.find(".win-heading").width(),
            width = this.$el.find(".win-heading").width() / 2,
            height = this.$el.height(),
            headerHeight = this.$el.find(".win-heading").height(),
            x,
            y;

            if (this.model.get("rotationAngle") === 0) {
                x = touch.clientX - width - 20;
                y = touch.clientY - headerHeight;

                // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
                if (x >= 0 && touch.clientX < ($("#map").width() - width - 10) && y >= 50 && touch.clientY < ($("#map").height() - $(".win-body").height() - 75)) {
                    this.$el.css({
                        "left": x + "px",
                        "top": y + "px"
                    });
                }
            }
            else if (this.model.get("rotationAngle") === 90) {
                console.log("angle 90")
                x = touch.clientX - $(".win-body").height() + 75;
                y = touch.clientY - $(".win-body").width();

                // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
                if (x - $(".win-body").height()/2 >= 0 && x < ($("#map").width() - 1.5 * headerWidth - 75) && y >= 0 + headerHeight && y < ($("#map").height() - headerWidth - 10)) {
                    this.$el.css({
                        "left": x + "px",
                        "top": y + "px"
                    });
                }
            }
            else if (this.model.get("rotationAngle") === 180) {

                x = touch.clientX - headerWidth - width + 20;
                y = touch.clientY - headerHeight;

                // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
                if (x + 1.5 * width >= 0 && x < ($("#map").width() - 2 * headerWidth) && y - height >= 0 && y < ($("#map").height() - height / 2)) {
                    this.$el.css({
                        "left": x + "px",
                        "top": y + "px"
                    });
                }
            }
            else if (this.model.get("rotationAngle") === 270) {

                x = touch.clientX - headerWidth;
                y = touch.clientY + width - 20;

                // draggable() does not work for Touch Event, for that reason this function must be adjusted, so that is movable within viewport
                if (x + height / 2 - headerHeight >= 0 && x < ($("#map").width() - headerWidth - 50) && y - headerWidth >= 0 && y < ($("#map").height() - headerWidth + width)) {
                    this.$el.css({
                        "left": x + "px",
                        "top": y + "px"
                    });
                }
            }
    },
    touchStartWindow: function (evt) {
        var touch = evt.changedTouches[0],
        //this.windowLeft = document.getElementsByClassName("tool-window")[0].style.left
            //element = document.querySelector("#tool-window"),
            rect =  document.getElementsByClassName("tool-window")[0].getBoundingClientRect();
        //this.windowLeft = getComputedStyle(element).left;
        //this.windowLeft = document.getElementsByClassName("tool-window")[0].clientLeft;
        // this.windowTop = getComputedStyle(element).top;
        // this.windowTop = document.getElementsByClassName("tool-window")[0].clientTop;
        this.windowLeft = rect.left;
        this.windowTop = rect.top;
        this.startX = parseInt(touch.clientX);
        this.startY = parseInt(touch.clientY);
        evt.preventDefault()
    },
    touchMoveWindow: function (evt) {
        var touch = evt.changedTouches[0],
           // width = this.$el.find(".win-heading").width(),
            width = document.getElementsByClassName("tool-window")[0].clientWidth,
            height = document.getElementsByClassName("tool-window")[0].clientHeight,
            distX,
            distY,
            newPosX,
            newPosY;

            if (this.model.get("rotationAngle") === 0) {
                distX = parseInt(touch.clientX) - this.startX;
                distY = parseInt(touch.clientY) - this.startY;
                newPosX = distX + parseInt(this.windowLeft);
                newPosY = distY + parseInt(this.windowTop);
                this.$el.css({
                    "left": ( (newPosX +  width > $("#map").width()) ? ($("#map").width() - width - 40) : (newPosX < 20 )? 20 : newPosX) + "px",
                    "top":  ( (newPosY + height  > $("#map").height() - 40) ? ($("#map").height() - height - 40) : (newPosY < 20 )? 20 : newPosY) + "px"
                });
            }
            else if (this.model.get("rotationAngle") === 90) {
                distX = parseInt(touch.clientX) - this.startX;
                distY = parseInt(touch.clientY) - this.startY;
                newPosX = distX + parseInt(this.windowLeft) + height;
                newPosY = distY + parseInt(this.windowTop);

                this.$el.css({
                    "left": ( (newPosX  > $("#map").width() - 20) ? ($("#map").width()- 20) : (newPosX -height < 20 )? 20 + height : newPosX) + "px",
                    "top":  ( (newPosY + width  > $("#map").height() - 40) ? ($("#map").height() - width - 40) : newPosY < 20 ? 20 : newPosY) + "px",
                    "transform-origin": "top left"
                });

            }
            if (this.model.get("rotationAngle") === 180) {
                distX = parseInt(touch.clientX) - this.startX;
                distY = parseInt(touch.clientY) - this.startY;
                newPosX = distX + parseInt(this.windowLeft) + width;
                newPosY = distY + parseInt(this.windowTop) + height;
                this.$el.css({
                    "left": ( (newPosX > $("#map").width()) ? ($("#map").width() - 40) : (newPosX - width < 20 )? 20 + width : newPosX) + "px",
                    "top":  ( (newPosY  > $("#map").height() - 40) ? ($("#map").height() - 40) : (newPosY - height  < 20 )? 20 + height: newPosY) + "px",
                    "transform-origin": "top left"
                });
            }
            else if (this.model.get("rotationAngle") === 270) {
                distX = parseInt(touch.clientX) - this.startX;
                distY = parseInt(touch.clientY) - this.startY;
                newPosX = distX + parseInt(this.windowLeft);
                newPosY = distY + parseInt(this.windowTop) + width;


                this.$el.css({
                    "left": ( (newPosX + height > $("#map").width() - 20) ? ($("#map").width() - height - 20) : (newPosX < 20 )? 20  : newPosX) + "px",
                    "top":  ( (newPosY  > $("#map").height() - 40) ? ($("#map").height() - 40) : newPosY -width  < 20 ? 20 + width : newPosY) + "px",
                    "transform-origin": "top left"
                });
            }
            console.log(newPosX + height)
                console.log(newPosY + width)
            evt.preventDefault()

    }
});

export default WindowView;
