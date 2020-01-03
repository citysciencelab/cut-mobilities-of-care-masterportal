import LayerSliderTemplate from "text-loader!./template.html";
import "bootstrap-slider";

const LayerSliderView = Backbone.View.extend({
    events: {
        "click #play": "playSlider",
        "click #stop": "stopSlider",
        "click #backward": "backwardSlider",
        "click #forward": "forwardSlider",
        // This event fires when the slider is dragged
        "slide input.slider": "dragHandle"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            },
            "change:activeLayer": this.layerSwitched
        });
        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    className: "layerslider",
    template: _.template(LayerSliderTemplate),

    render: function () {
        var attr;

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

    initHandle: function () {
        this.$el.find(".slider").slider();
        this.model.setActiveIndex(0);
    },

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
     * Startet das Interval
     * @returns {void}
     */
    playSlider: function () {
        this.model.startInterval();
        this.toggleGlyphicon("glyphicon-pause");
    },

    /**
     * Stoppt das Interval durch Pause oder Stop
     * @returns {void}
     */
    stopSlider: function () {
        if (!_.isNull(this.model.get("windowsInterval"))) {
            this.toggleGlyphicon("glyphicon-stop");
            this.model.stopInterval();
        }
        else {
            this.model.reset();
        }
    },

    /**
     * Triggert den vorherigen Layer an
     * @returns {void}
     */
    backwardSlider: function () {
        this.model.backwardLayer();
    },

    /**
     * Triggert den nächsten Layer an
     * @returns {void}
     */
    forwardSlider: function () {
        this.model.forwardLayer();
    },

    /**
     * Steuert die Aktionen nach einem Layerwechsel im Model
     * @returns {void}
     */
    layerSwitched: function () {
        this.setProgress();
        this.setTitle();
    },

    /**
     * Berechnet und setzt die Breite und Abstand der ProgressBar
     * @returns {void}
     */
    setProgress: function () {
        var activeIndex = this.model.getActiveIndex(),
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
     * Setzt den Titel des aktiven Layer
     * @returns {void}
     */
    setTitle: function () {
        this.$el.find("#title").val(this.model.get("activeLayer").title);
    },

    /**
     * toggelt das Pause / Stop Glyphicon
     * @param   {string} glyph Class des Glyphicon
     * @returns {void}
     */
    toggleGlyphicon: function (glyph) {
        this.$el.find("#stop").find("span").removeClass("glyphicon-stop glyphicon-pause").addClass(glyph);
    },
    dragHandle: function (evt) {
        this.model.dragHandle(evt.value);
    }
});


export default LayerSliderView;
