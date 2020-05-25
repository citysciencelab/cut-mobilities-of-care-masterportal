import LayerSliderTemplate from "text-loader!./template.html";
import "bootstrap-slider";

const LayerSliderView = Backbone.View.extend(/** @lends LayerSliderView.prototype*/{
    events: {
        "click #play": "playSlider",
        "click #stop": "stopSlider",
        "click #backward": "backwardSlider",
        "click #forward": "forwardSlider",
        "slide input.slider": "dragHandle"
    },
    /**
     * @class LayerSliderView
     * @extends Backbone.View
     * @memberof Tools.LayerSlider
     * @listens Tools.LayerSlider#changeIsActive
     * @listens Tools.LayerSlider#changeActiveLayer
     * @constructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            },
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            },
            "change:activeLayer": this.layerSwitched
        });
        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    className: "layerslider",

    /**
     * @member LayerSliderTemplate
     * @description Template used to create the layer slider
     * @memberof Tools.LayerSlider
     */
    template: _.template(LayerSliderTemplate),

    /**
     * Render function.
     * @returns {void}
     */
    render: function () {
        let attr;

        if (this.model.get("isActive") === true) {
            attr = this.model.toJSON();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.layerSwitched();
            this.delegateEvents();
            if (this.model.get("sliderType") === "handle") {
                this.initHandle();
                this.appendLayerTitles();
            }
        }
        else {
            this.model.reset();
            this.$el.empty();
            this.undelegateEvents();
        }
        return this;
    },

    /**
     * Initializes the handle
     * @returns {void}
     */
    initHandle: function () {
        this.$el.find(".slider").slider();
        this.model.setActiveIndex(0);
    },

    /**
     * Appends the layer titles based on the position of the slider ticks.
     * @returns {void}
     */
    appendLayerTitles: function () {
        const ticks = this.$el.find(".slider-tick").toArray(),
            layerIds = this.model.get("layerIds"),
            length = layerIds.length;
        let width = this.$el.find(".slider-layer-titles").css("width");

        width = parseFloat(width.replace("px", ""));
        width = width / length;
        ticks.forEach((tick, index) => {
            const layerTitle = layerIds[index].title,
                left = width * index;
            let className = "text text-center",
                htmlString = "";

            if (index === 0) {
                className = "text text-left";
                htmlString = "<span style=\"width:" + width + "px\" class=\"" + className + "\">" + layerTitle + "</span>";
            }
            else if (index === length - 1) {
                className = "text text-right";
                htmlString = "<span style=\"left:" + left + "px;width:" + width + "px\" class=\"" + className + "\">" + layerTitle + "</span>";
            }
            else {
                htmlString = "<span style=\"left:" + left + "px;width:" + width + "px\" class=\"" + className + "\">" + layerTitle + "</span>";
            }
            this.$el.find(".slider-layer-titles").append(htmlString);
        });
    },

    /**
     * Starts the interval.
     * @returns {void}
     */
    playSlider: function () {
        this.model.startInterval();
        this.toggleGlyphicon("glyphicon-pause");
    },

    /**
     * Stops the interval by pause or stop.
     * @returns {void}
     */
    stopSlider: function () {
        if (this.model.get("windowsInterval") !== null) {
            this.toggleGlyphicon("glyphicon-stop");
            this.model.stopInterval();
        }
        else {
            this.model.reset();
        }
    },

    /**
     * Triggers the backward layer.
     * @returns {void}
     */
    backwardSlider: function () {
        this.model.backwardLayer();
    },

    /**
     * Triggers the forward layer.
     * @returns {void}
     */
    forwardSlider: function () {
        this.model.forwardLayer();
    },

    /**
     * Steers the actions after a changed layer in the model.
     * @returns {void}
     */
    layerSwitched: function () {
        this.setProgress();
        this.setTitle();
    },

    /**
     * Calculates the progress bar.
     * @returns {void}
     */
    setProgress: function () {
        const activeIndex = this.model.getActiveIndex(),
            max = this.model.get("layerIds").length,
            progressBarWidth = this.model.get("progressBarWidth"),
            singleStep = (100 - progressBarWidth) / (max - 1);

        this.$el.find(".progress-bar").attr("aria-valuenow", activeIndex + 1);

        if (activeIndex === -1) {
            this.$el.find(".progress-bar").css("width", "0%");
            this.$el.find(".progress-bar").css("margin-left", "0%");
        }
        else {
            this.$el.find(".progress-bar").css("width", progressBarWidth + "%");
            this.$el.find(".progress-bar").css("margin-left", (activeIndex * singleStep) + "%");
        }
    },

    /**
     * Sets the layer title.
     * @returns {void}
     */
    setTitle: function () {
        this.$el.find("#title").val(this.model.get("activeLayer").title);
    },

    /**
     * Toggles the pause / stop glyphicon.
     * @param   {string} glyph Class des Glyphicon
     * @returns {void}
     */
    toggleGlyphicon: function (glyph) {
        this.$el.find("#stop").find("span").removeClass("glyphicon-stop glyphicon-pause").addClass(glyph);
    },

    /**
     * Calls model-function on dragged handle.
     * @param {Event} evt Drag event.
     * @returns {void}
     */
    dragHandle: function (evt) {
        this.model.dragHandle(evt.value);
    }
});


export default LayerSliderView;
