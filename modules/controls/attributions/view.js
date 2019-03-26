import TemplateShow from "text-loader!./templateShow.html";
import TemplateHide from "text-loader!./templateHide.html";
import Attributions from "./model";

const AttributionsView = Backbone.View.extend({
    events: {
        "click .attributions-button": "toggleIsContentVisible"
    },
    initialize: function () {
        var channel = Radio.channel("AttributionsView"),
            jAttributionsConfig = Radio.request("Parser", "getPortalConfig").controls.attributions;

        this.model = new Attributions(jAttributionsConfig);

        this.listenTo(channel, {
            "renderAttributions": this.renderAttributions
        });

        this.listenTo(this.model, {
            "change:isContentVisible": this.renderAttributions,
            "change:attributionList": this.renderAttributions,
            "change:isVisibleInMap": this.toggleIsVisibleInMap,
            "renderAttributions": this.renderAttributions
        });

        this.toggleIsVisibleInMap(this.model.get("isVisibleInMap"));
    },
    templateShow: _.template(TemplateShow),
    templateHide: _.template(TemplateHide),
    render: function () {
        this.renderAttributions();
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
        if (_.isEmpty(attr.attributionList) === true) {
            this.$(".attributions-div").removeClass("attributions-div");
        }
        else {
            this.$(".attributions-div").addClass("attributions-div");
        }
        return this;
    },

    toggleIsContentVisible: function () {
        this.model.toggleIsContentVisible();
    },

    toggleIsVisibleInMap: function (isVisible) {
        console.log("toggleIsVisibleInMap");
        //TODO das hier muss öfter getriggert werden.

        if (isVisible) {
            this.$el.show();
            this.$el.addClass("attributions-view");
        }
        else {
            this.$el.hide();
        }
    }
});

export default AttributionsView;
