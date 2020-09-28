import LegendTemplate from "text-loader!./template.html";
import ContentTemplate from "text-loader!../content.html";
/**
 * @member LegendTemplate
 * @description Template of desktop legend
 * @memberof Legend.Desktop
 */
/**
 * @member ContentTemplate
 * @description Template of legend content identical for mobile and desktop view
 * @see Legend.ContentTemplate
 * @memberof Legend.Desktop
 */
const LegendView = Backbone.View.extend(/** @lends LegendView.prototype */{
    events: {
        "click .glyphicon-remove": "hide",
        "touchmove .title": "touchMoveWindow",
        "touchstart .title": "touchStartWindow",
        "touchend .title": "touchMoveEnd",
        "click #collapseAll-btn": "toggleCollapsePanels"
    },
    /**
     * @class LegendView
     * @extends Backbone.View
     * @memberof Legend.Desktop
     * @constructs
     * @listens Legend#hide
     * @listens Legend#changeLegendParams
     * @listens Legend#changeParamsStyleWMSArray
     * @listens Tool#changeIsActive
     * @listens Map#RadioTriggerMapUpdateSize
     */
    initialize: function () {
        $(window).resize(function () {
            if ($(".legend-win-content").height() !== null) {
                $(".legend-win-content").css("max-height", $(window).height() * 0.7);
            }
        });

        this.listenTo(this.model, {
            "change:legendParams": this.paramsChanged,
            "change:paramsStyleWMSArray": this.paramsChanged,
            "change:isActive": function (model, value) {
                if (value) {
                    this.show();
                }
                else {
                    this.hide();
                }
            },
            "change:currentLng": this.render
        });

        this.listenTo(Radio.channel("Map"), {
            "updateSize": this.updateLegendSize
        });
        if (this.model.get("isActive") === true) {
            this.show();
        }
    },
    className: "legend-win",
    template: _.template(LegendTemplate),
    contentTemplate: _.template(ContentTemplate),
    /**
    * todo
    * @returns {Legend.Desktop.LegendView} returns this
    */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $("#masterportal-container").append(this.$el.html(this.template(attr)));
        $(".legend-win-content").css("max-height", $("#masterportal-container").height() * 0.7);
        this.$el.draggable({
            containment: "#map",
            handle: ".legend-win-header"
        });

        return this;
    },
    /**
     * Reacts on change of legend params and rebuilds legend
     * @returns {void}
     */
    paramsChanged: function () {
        const legendParams = this.model.get("legendParams");

        // Filtern von this.unset("legendParams")
        if (typeof legendParams !== "undefined" && legendParams.length > 0) {
            Radio.trigger("Layer", "updateLayerInfo", this.model.get("paramsStyleWMS").styleWMSName);
            this.addContentHTML(legendParams);
            this.render();
        }
    },
    /**
     * Adds the rendered HTML to the legend definition, is needed in the template
     * @param {Object[]} legendParams Legend objects via reference
     * @returns {void}
     */
    addContentHTML: function (legendParams) {
        legendParams.forEach(legendDefinition => {
            if (legendDefinition.legend) {
                legendDefinition.legend.forEach(legend => {
                    legend.html = this.contentTemplate(legend);
                });
            }
        });
    },
    /**
    * todo
    * @returns {void}
    */
    show: function () {
        if ($("body").find(".legend-win").length === 0) {
            this.render();
        }
        this.model.setLayerList();
        this.$el.show();
    },
    /**
    * todo
    * @returns {void}
    */
    hide: function () {
        this.$el.hide();
        this.model.setIsActive(false);
    },
    /**
    * todo
    * @returns {void}
    */
    removeView: function () {
        this.$el.hide();
        this.remove();
    },
    /**
    * Fits the legend height according to the class masterportal-container
    * currently this function is executed when map sends updateSize
    * @returns {void}
    */
    updateLegendSize: function () {
        $(".legend-win-content").css("max-height", $("#masterportal-container").height() * 0.7);
    },
    /**
     * Triggered on TouchStart
     * @param {Event} evt Event, legend window being touched
     * @return {void}
     */
    touchStartWindow: function (evt) {
        const touch = evt.changedTouches[0],
            rect = document.querySelector(".legend-win").getBoundingClientRect();

        this.model.setWindowLeft(rect.left);
        this.model.setWindowTop(rect.top);
        this.model.setStartX(parseInt(touch.clientX, 10));
        this.model.setStartY(parseInt(touch.clientY, 10));

        evt.preventDefault();
    },
    /**
     * Triggered on TouchMove
     * @param {Event} evt Event of moved legend window
     * @return {void}
     */
    touchMoveWindow: function (evt) {
        const touch = evt.changedTouches[0],
            legendWinElement = document.querySelector(".legend-win"),
            mapDomElement = document.getElementById("map"),
            width = legendWinElement.clientWidth,
            height = legendWinElement.clientHeight,
            mapWidth = mapDomElement.clientWidth,
            mapHeight = mapDomElement.clientHeight,
            newPosition = this.getNewPosition(touch, width, height, mapWidth, mapHeight);

        this.$el.css({
            "left": newPosition.left,
            "top": newPosition.top,
            "width": width,
            "transform-origin": "top left"
        });

        evt.preventDefault();
    },
    /**
     * Triggered on TouchEnd
     * @return {void}
     */
    touchMoveEnd: function () {
        this.$el.css({
            "width": ""
        });
    },
    /**
     * Function to calculate the new left and top positions
     * @param {Object} touch Object containing the touch attributes
     * @param {Number} width Window width
     * @param {Number} height Window height
     * @param {Number} mapWidth Width of the map
     * @param {Number} mapHeight Height of the map
     * @return {Object} newPosition Object containing the new position
     */
    getNewPosition: function (touch, width, height, mapWidth, mapHeight) {
        const distX = parseInt(touch.clientX, 10) - this.model.get("startX"),
            distY = parseInt(touch.clientY, 10) - this.model.get("startY"),
            newPosition = {},
            windowL = this.model.get("windowLeft"),
            windowT = this.model.get("windowTop"),
            newPosX = distX + parseInt(windowL, 10),
            newPosY = distY + parseInt(windowT, 10) - 60;


        if (newPosX + width > mapWidth) {
            newPosition.left = mapWidth - width - 40 + "px";
        }
        else if (newPosX < 20) {
            newPosition.left = 20 + "px";
        }
        else {
            newPosition.left = newPosX + "px";
        }

        if (newPosY + height > mapHeight - 60) {
            newPosition.top = mapHeight - height - 80 + "px";
        }
        else if (newPosY < 20) {
            newPosition.top = 20 + "px";
        }
        else {
            newPosition.top = newPosY + "px";
        }

        return newPosition;
    },
    /**
     * collapse or folds out all legend panels
     * toogles the icon of the collapse-all button
     * @param {object} evt trigger event
     * @returns {void}
    */
    toggleCollapsePanels: function (evt) {
        const panels = this.$(".panel-collapse");

        if (evt.target.classList.contains("fold-in")) {
            evt.target.title = this.model.get("foldOutAllText");
            panels.each((i, panel) => {
                $(panel).collapse("hide");
            });
        }
        else {
            evt.target.title = this.model.get("collapseAllText");
            panels.each((i, panel) => {
                $(panel).collapse("show");
            });
        }

        $("#collapseAll-btn").toggleClass("glyphicon-arrow-down glyphicon-arrow-up");
        $("#collapseAll-btn").toggleClass("fold-in fold-out");
    }
});

export default LegendView;
