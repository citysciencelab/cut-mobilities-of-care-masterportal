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
            "change:isVisibleInMap": this.changeIsVisibleInMap,
            "renderAttributions": this.renderAttributions
        });

        this.model.checkModelsByAttributions();
        this.renderAttributions();
    },
    templateShow: _.template(TemplateShow),
    templateHide: _.template(TemplateHide),
    /*
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.templateShow(attr));

        this.changeIsVisibleInMap(this.model.get("isVisibleInMap"));

        if (attr.attributionList.length === 0) {
            this.$(".attributions-div").removeClass("attributions-div");
        }
        return this;
    },
    */

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
    },

    toggleIsContentVisible: function () {
        this.model.toggleIsContentVisible();
    },

    changeIsVisibleInMap: function (isVisible) {
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
