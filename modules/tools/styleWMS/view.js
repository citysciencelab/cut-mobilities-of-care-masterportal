define([
    "backbone",
    "text!modules/tools/styleWMS/template.html",
    "modules/tools/styleWMS/model",
    "colorpicker"
], function () {

    var Backbone = require("backbone"),
        StyleWMS = require("modules/tools/styleWMS/model"),
        StyleWMSTemplate = require("text!modules/tools/styleWMS/template.html"),
        StyleWMSView;

    StyleWMSView = Backbone.View.extend({
        model: new StyleWMS(),
        className: "win-body",
        template: _.template(StyleWMSTemplate),
        events: {
            "change #layerField": "setLayerId",
            "change #attributField": "setAttributeName",
            "change #numberField": "setNumberOfClasses",
            "click button": "setStyle"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:layer change:attributeName change:numberOfClasses": this.render,
                "invalid": this.showErrorMessage
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },

        setLayerId: function (evt) {
            this.model.setLayerId(evt.target.value);
        },

        setAttributeName: function (evt) {
            this.model.setAttributeName(evt.target.value);
        },

        setNumberOfClasses: function (evt) {
            this.model.setNumberOfClasses(evt.target.value);
            this.$el.find("[class*=selected-color]").parent().colorpicker();
        },

        setStyle: function () {
            var styleClassAttributes = [];

            this.hideErrorMessage();
            for (var i = 0; i < this.model.get("numberOfClasses"); i++) {
                console.log($(".selected-color" + i).val());
                styleClassAttributes.push({
                    startRange: $(".start-range" + i).val(),
                    stopRange: $(".stop-range" + i).val(),
                    color: $(".selected-color" + i).val()
                });
            }
            this.model.setStyleClassAttributes(styleClassAttributes);
        },

        showErrorMessage: function () {
            _.each(this.model.getErrors(), function (error) {
                if (_.has(error, "colorText") === true) {
                    this.$el.find(".selected-color" + error.colorIndex).parent().addClass("has-error");
                    this.$el.find(".selected-color" + error.colorIndex).prepend("<span class='error'>" + error.colorText + "</span>");
                }
                if (_.has(error, "rangeText") === true) {
                    this.$el.find(".start-range" + error.rangeIndex).parent().addClass("has-error");
                    this.$el.find(".stop-range" + error.rangeIndex).parent().addClass("has-error");
                    this.$el.find(".start-range" + error.rangeIndex).after("<span class='error'>" + error.rangeText + "</span>");
                }
                if (_.has(error, "intersectText") === true) {
                    this.$el.find(".start-range" + error.intersectIndex).parent().addClass("has-error");
                    this.$el.find(".stop-range" + error.prevIndex).parent().addClass("has-error");
                    this.$el.find(".start-range" + error.intersectIndex).after("<span class='error'>" + error.intersectText + "</span>");
                    this.$el.find(".stop-range" + error.prevIndex).after("<span class='error'>" + error.intersectText + "</span>");
                }
                if (_.has(error, "minText") === true) {
                    this.$el.find(".start-range" + error.minIndex).parent().addClass("has-error");
                    this.$el.find(".start-range" + error.minIndex).after("<span class='error'>" + error.minText + "</span>");
                }
                if (_.has(error, "maxText") === true) {
                    this.$el.find(".stop-range" + error.maxIndex).parent().addClass("has-error");
                    this.$el.find(".stop-range" + error.maxIndex).after("<span class='error'>" + error.maxText + "</span>");
                }
            }, this);
        },

        hideErrorMessage: function () {
            this.$el.find(".error").remove();
            this.$el.find("[class*=selected-color], [class*=start-range], [class*=stop-range]").parent().removeClass("has-error");
        }
    });

    return StyleWMSView;
});
