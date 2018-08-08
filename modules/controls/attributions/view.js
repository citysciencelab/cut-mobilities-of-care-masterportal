define(function (require) {

    var TemplateShow = require("text!modules/controls/attributions/templateShow.html"),
        TemplateHide = require("text!modules/controls/attributions/templateHide.html"),
        Attributions = require("modules/controls/attributions/model"),
        AttributionsView;

    AttributionsView = Backbone.View.extend({
        model: new Attributions(),
        templateShow: _.template(TemplateShow),
        templateHide: _.template(TemplateHide),
        events: {
            "click .attributions-button": "toggleIsContentVisible"
        },
        initialize: function () {
            var channel = Radio.channel("AttributionsView"),
                isViewMobile = Radio.request("Util", "isViewMobile");

            this.listenTo(channel, {
                "renderAttributions": this.renderAttributions
            });

            this.listenTo(this.model, {
                "change:isContentVisible": this.renderAttributions,
                "change:modelList": this.renderAttributions,
                "change:isVisibleInMap": this.toggleIsVisibleInMap
            });

            this.render();

            if (isViewMobile === true) {
                this.model.setIsContentVisible(this.model.get("isInitOpenMobile"));
            }
            else {
                this.model.setIsContentVisible(this.model.get("isInitOpenDesktop"));
            }
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.templateShow(attr));
            if (this.model.get("isVisibleInMap") === true) {
                this.$el.show();
                this.$el.addClass("attributions-view");
            }
            else {
                this.$el.hide();
            }

            if (attr.modelList.length === 0) {
                this.$(".attributions-div").removeClass("attributions-div");
            }
            return this;
        },

        renderAttributions: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isContentVisible") === true) {
                this.$el.html(this.templateShow(attr));
            }
            else {
                this.$el.html(this.templateHide(attr));
            }
            if (_.isEmpty(attr.modelList) === true) {
                this.$(".attributions-div").removeClass("attributions-div");
            }
            else {
                this.$(".attributions-div").addClass("attributions-div");
            }
        },

        toggleIsContentVisible: function () {
            this.model.toggleIsContentVisible();
        },

        toggleIsVisibleInMap: function () {
            this.$el.toggle();
        }
    });

    return AttributionsView;
});
