import Window from "./model";
import templateMax from "text-loader!./templateMax.html";
import templateTable from "text-loader!./templateTable.html";
import "jquery-ui/ui/widgets/draggable";

/**
 * @member WindowViewTemplateMax
 * @description Template used to create the Tool Window maximised
 * @memberof WindowView
 */
/**
 * @member WindowViewTemplateTable
 * @description Template used to create Tool Window for the table
 * @memberof WindowView
 */

const WindowView = Backbone.View.extend(/** @lends WindowView.prototype */{
    events: {
        "click .glyphicon-minus": "minimize",
        "click .header > .title": "maximize",
        "click .glyphicon-remove": "hide",
        "touchmove .title": "touchMoveWindow",
        "touchstart .title": "touchStartWindow",
        "touchend .title": "touchMoveEnd"
    },

     /**
     * @class WindowView
     * @extends Backbone.View
     * @memberof Window
     * @constructs
     * @fires Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @listens WindowView#changeIsVisible
     * @listens WindowView#changeWinType
     * @listens WindowView#RadioTriggerWindowHide
     */
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

     /**
     * Renders the Window
     * @return {Window} returns this
     */
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
        }
        return this;
    },
     /**
     * Minimizes the Window
     *  @return {void}
     */
    minimize: function () {
        this.model.set("maxPosTop", this.$el.css("top"));
        this.model.set("maxPosLeft", this.$el.css("left"));
        this.$(".win-body").hide();
        this.$(".glyphicon-minus").hide();
        this.$el.css({"top": "auto", "bottom": "0", "left": "0", "margin-bottom": "60px"});
        this.$(".header").addClass("header-min");
        this.$el.draggable("disable");
    },
    /**
     * Maximizes the Window
     *  @return {void}
     */
    maximize: function () {
        if (this.$(".win-body").css("display") === "none") {
            this.$(".win-body").show();
            this.$(".glyphicon-minus").show();
            this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
            this.$(".header").removeClass("header-min");
            this.$el.draggable("enable");
        }
    },
    /**
     * Hides the Window
     *  @return {void}
     */
    hide: function () {
        var toolModel = Radio.request("ModelList", "getModelByAttributes", {id: this.model.get("winType")});

        if (toolModel) {
            toolModel.setIsActive(false);
            Radio.trigger("ModelList", "toggleDefaultTool");
        }
    },
    /**
     * Triggered on TouchStart
     * @param {Event} evt Event, window being touched
     * @return {void}
     */
    touchStartWindow: function (evt) {
        var touch = evt.changedTouches[0],
            rect =  document.getElementsByClassName("tool-window")[0].getBoundingClientRect();
        this.windowLeft = rect.left;
        this.windowTop = rect.top;
        this.startX = parseInt(touch.clientX);
        this.startY = parseInt(touch.clientY);
        evt.preventDefault()
    },
     /**
     * Triggered on TouchMove
     * @param {Event} evt Event, being moved
     * @return {void}
     */
    touchMoveWindow: function (evt) {
        var touch = evt.changedTouches[0],
            width = document.getElementsByClassName("tool-window")[0].clientWidth,
            height = document.getElementsByClassName("tool-window")[0].clientHeight,
            mapWidth = document.getElementById("map").clientWidth,
            mapHeight = document.getElementById("map").clientHeight,
            distX = parseInt(touch.clientX) - this.startX,
            distY = parseInt(touch.clientY) - this.startY,
            newPosX,
            newPosY;

            if (this.model.get("rotationAngle") === 0) {
                newPosX = distX + parseInt(this.windowLeft);
                newPosY = distY + parseInt(this.windowTop);
                this.$el.css({
                    "left": ( (newPosX +  width > mapWidth) ? (mapWidth - width - 40) : (newPosX < 20 )? 20 : newPosX) + "px",
                    "top":  ( (newPosY + height  > mapHeight - 40) ? (mapHeight - height - 40) : (newPosY < 20 )? 20 : newPosY) + "px",
                    "width": width,
                    "transform-origin": "top left"
                });
            }
            else if (this.model.get("rotationAngle") === 90) {
                newPosX = distX + parseInt(this.windowLeft) + height;
                newPosY = distY + parseInt(this.windowTop);

                this.$el.css({
                    "left": ( (newPosX  > mapWidth - 20) ? (mapWidth- 20) : (newPosX -height < 20 )? 20 + height : newPosX) + "px",
                    "top":  ( (newPosY + width  > mapHeight - 40) ? (mapHeight - width - 40) : newPosY < 20 ? 20 : newPosY) + "px",
                    "width": width,
                    "transform-origin": "top left"
                });

            }
            if (this.model.get("rotationAngle") === 180) {
                newPosX = distX + parseInt(this.windowLeft) + width;
                newPosY = distY + parseInt(this.windowTop) + height;
                this.$el.css({
                    "left": ( (newPosX >mapWidth) ? (mapWidth - 40) : (newPosX - width < 20 )? 20 + width : newPosX) + "px",
                    "top":  ( (newPosY  > mapHeight - 40) ? (mapHeight - 40) : (newPosY - height  < 20 )? 20 + height: newPosY) + "px",
                    "width": width,
                    "transform-origin": "top left"
                });
            }
            else if (this.model.get("rotationAngle") === 270) {
                newPosX = distX + parseInt(this.windowLeft);
                newPosY = distY + parseInt(this.windowTop) + width;

                this.$el.css({
                    "left": ( (newPosX + height > mapWidth - 20) ? (mapWidth - height - 20) : (newPosX < 20 )? 20  : newPosX) + "px",
                    "top":  ( (newPosY  > mapHeight - 40) ? (mapHeight - 40) : newPosY -width  < 20 ? 20 + width : newPosY) + "px",
                    "width": width,
                    "transform-origin": "top left"
                });
            }

            evt.preventDefault()

    },
     /**
     * Triggered on TouchEnd
     * @param {Event} evt Event, window on touchend
     * @return {void}
     */
    touchMoveEnd: function (evt) {
        this.$el.css({
            "width": ""
        });
    }
});

export default WindowView;
