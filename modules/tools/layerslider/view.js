define(function (require) {
    var LayersliderTemplate = require("text!modules/tools/layerslider/template.html"),
        LayersliderModel = require("modules/tools/layerslider/model"),
        LayersliderView;

    LayersliderView = Backbone.View.extend({
        events: {
            "click #play": "playSlider",
            "click #stop": "stopSlider",
            "click #backward": "backwardSlider",
            "click #forward": "forwardSlider"
        },
        initialize: function (attr) {
            var layerIds = _.has(attr, "layerIds") && _.isArray(attr.layerIds) ? attr.layerIds : null,
                title = _.has(attr, "title") ? attr.title : null,
                timeInterval = _.has(attr, "timeInterval") ? attr.timeInterval : null;

            //Pflichtattribut abfragen
            if (!layerIds) {
                console.error("Konfiguration des layersliders unvollständig");
                return;
            }
            this.model = new LayersliderModel(layerIds, title, timeInterval);

            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:activeLayer": this.layerSwitched
            });
        },
        className: "win-body",
        template: _.template(LayersliderTemplate),

        playSlider: function () {

        },

        stopSlider: function () {

        },

        backwardSlider: function () {
            this.model.backwardLayer();
        },

        forwardSlider: function () {
            this.model.forwardLayer();
        },

        render: function () {
            var attr;

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },

        layerSwitched: function () {
            this.setProgress();
            this.setTitle();
        },

        setProgress: function () {
            var finishedPercent = this.model.getFinished(),
                activeIndex = this.model.getActiveIndex(),
                max = this.model.get("layerIds").length - 1,
                progressBarWidth = this.model.get("progressBarWidth");

            if (_.isUndefined(activeIndex)) {
                this.$el.find(".progress-bar").attr("aria-valuenow", "0");
                this.$el.find(".progress-bar").css("width", "0%")
                this.$el.find(".progress-bar").css('margin-left', "0%")
            }
            else if (activeIndex === 0) {
                this.$el.find(".progress-bar").attr("aria-valuenow", activeIndex + 1);
                this.$el.find(".progress-bar").css("width", progressBarWidth +"%")
                this.$el.find(".progress-bar").css("margin-left", "0%")
            }
            else if (activeIndex === max) {
                this.$el.find(".progress-bar").attr("aria-valuenow", activeIndex + 1);
                this.$el.find(".progress-bar").css("width", progressBarWidth +"%")
                this.$el.find(".progress-bar").css("margin-left", (100 - progressBarWidth) + "%")
            }
            else {
                this.$el.find(".progress-bar").attr("aria-valuenow", activeIndex + 1);
                this.$el.find(".progress-bar").css("width", progressBarWidth +"%")
                this.$el.find(".progress-bar").css("margin-left", ((100 - progressBarWidth) / 2) + "%")
            }
        },

        setTitle: function () {
            this.$el.find("#title").val(this.model.get("activeLayer").title);
        }
    });

    return LayersliderView;
});
