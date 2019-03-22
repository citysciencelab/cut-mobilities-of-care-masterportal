import MainTemplate from "text-loader!./main/template.html";
import TableNavModel from "./model";
import LayerListView from "./layer/listView";
import CategoryList from "./categories/view";
import ToolView from "./tool/view";
import CloseClickView from "./closeClickView";

const Menu = Backbone.View.extend({
    events: {
        "touchmove .icon-drag": "touchMoveMenu"
    },
    initialize: function () {
        this.render();
        this.renderLayerList();
        this.renderCategoryList();
        this.renderTools();
        this.hideContextMenu();

        this.listenTo(this.model, {
            "appendFilterContent": this.appendFilterContent
        });
    },
    model: new TableNavModel(),
    id: "table-nav",
    className: "table-nav-0deg",
    template: _.template(MainTemplate),
    render: function () {
        var that = this;

        $(this.el).html(this.template());
        $(".lgv-container").append(this.$el);
        this.$el.draggable({
            containment: "#map",
            handle: ".icon-drag",
            drag: function () {
                var rotAngle = that.model.get("rotateAngle");

                if (rotAngle === 0 || rotAngle === 180) {
                    that.$el.css({

                        "-webkit-transform-origin": "50% 50%",
                        "-ms-transform-origin": "50% 50%",
                        "-moz-transform-origin": "50% 50%"
                    });
                }
                else if (rotAngle === 90) {
                    that.$el.css({

                        "-webkit-transform-origin": "5% 50%",
                        "-ms-transform-origin": "5% 50%",
                        "-moz-transform-origin": "5% 50%"
                    });
                }
                else if (rotAngle === 270) {
                    that.$el.css({

                        "-webkit-transform-origin": "240px 240px",
                        "-ms-transform-origin": "240px 240px",
                        "-moz-transform-origin": "240px 240px"
                    });
                }
            },
            stop: function (evt, ui) {
                var pos = ui.helper.offset(),
                    x = pos.left,
                    y = pos.top;

                that.placeMenu(x, y);
            }
        });

        new CloseClickView().render();

        return this;
    },
    renderLayerList: function () {
        this.$el.find("#table-nav-main").append(new LayerListView().render().$el);
    },
    renderCategoryList: function () {
        this.$el.append(new CategoryList().$el);
    },
    renderTools: function () {
        new ToolView();
    },
    hideContextMenu: function () {
        $("body").attr("oncontextmenu", "return false;");
    },
    /**
     * add HTML content to the Categories Window
     * @param {DOM} element - from a tool view
     * @returns {void}
     */
    appendFilterContent: function (element) {
        this.$el.find(".table-filter-container").append(element);
    },
    touchMoveMenu: function (evt) {

        var touch = evt.originalEvent.touches[0],
            x = touch.clientX - 20,
            y = touch.clientY - 20,
            rotateAngle = this.model.get("rotateAngle"),
            menuWidth = $("#table-nav").width(),
            menuHeight = $("#table-nav").height(),
            that = this;

        if (rotateAngle === 0) {
            this.$el.css({
                "left": x + "px",
                "top": y + "px"
            });
        }
        else if (rotateAngle === 90) {
            this.$el.css({
                "left": x - menuWidth / 2 + menuHeight / 2 + "px",
                "top": y + menuWidth / 2 - menuHeight / 2 + "px"
            });
        }
        else if (rotateAngle === 180) {
            this.$el.css({
                "left": x - menuWidth + menuHeight / 2 + "px",
                "top": y + "px"
            });
        }
        else if (rotateAngle === 270) {
            this.$el.css({
                "left": x - menuWidth / 2 + menuHeight / 2 + "px",
                "top": y - menuWidth / 2 + "px"
            });
        }

        this.$el.on("touchend", function () {

            that.placeMenu(x, y);
        });

    },
    placeMenu: function (x, y) {
        var currentClass = $("#table-nav").attr("class"),
            posClass,
            minPos;

        minPos = this.calcSnapPosition(x, y);

        if (minPos === 0) {
            posClass = "table-nav-0deg";
            this.model.set("rotateAngle", 0);
        }
        else if (minPos === 1) {
            posClass = "table-nav-90deg";
            this.model.set("rotateAngle", 90);
        }
        else if (minPos === 2) {
            posClass = "table-nav-180deg";
            this.model.set("rotateAngle", 180);
        }
        else if (minPos === 3) {
            posClass = "table-nav-270deg";
            this.model.set("rotateAngle", 270);
        }

        this.$el.removeClass(currentClass);
        this.$el.addClass(posClass);
        this.$el.removeAttr("style");
    },
    calcSnapPosition (x, y) {
        var mapWidth,
            mapHeight,
            distTop,
            distLeft,
            distBottom,
            distRight,
            distArray = [],
            minDist,
            minPos;

        mapWidth = Math.round($(".lgv-container").width());
        mapHeight = Math.round($(".lgv-container").height());

        // calculate the distances of the current finger position to the middle positions of each side
        distBottom = Math.sqrt((mapWidth / 2 - x) * (mapWidth / 2 - x) + (mapHeight - y) * (mapHeight - y));
        distLeft = Math.sqrt((0 - x) * (0 - x) + (mapHeight / 2 - y) * (mapHeight / 2 - y));
        distTop = Math.sqrt((mapWidth / 2 - x) * (mapWidth / 2 - x) + (0 - y) * (0 - y));
        distRight = Math.sqrt((mapWidth - x) * (mapWidth - x) + (mapHeight / 2 - y) * (mapHeight / 2 - y));

        distArray.push(distBottom);
        distArray.push(distLeft);
        distArray.push(distTop);
        distArray.push(distRight);
        minDist = _.min(distArray);
        minPos = distArray.indexOf(minDist);

        return minPos;
    }
});

export default Menu;
