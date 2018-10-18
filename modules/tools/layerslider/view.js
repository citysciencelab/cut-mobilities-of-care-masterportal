import LayersliderTemplate from "text-loader!./template.html";

const LayersliderView = Backbone.View.extend({
    events: {
        "click #play": "playSlider",
        "click #stop": "stopSlider",
        "click #backward": "backwardSlider",
        "click #forward": "forwardSlider"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            },
            "change:activeLayer": this.layerSwitched
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    className: "layerslider",
    template: _.template(LayersliderTemplate),

    render: function () {
        var attr;

        if (this.model.get("isActive") === true) {
            attr = this.model.toJSON();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.layerSwitched();
            this.delegateEvents();
        }
        else {
            this.model.reset();
            this.$el.empty();
            this.undelegateEvents();
        }
        return this;
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
    }
});


export default LayersliderView;
