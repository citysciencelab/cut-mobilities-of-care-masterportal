import TemplateShow from "text-loader!./templateShow.html";
import TemplateHide from "text-loader!./templateHide.html";
import Attributions from "./model";

const AttributionsView = Backbone.View.extend(/** @lends AttributionsView.prototype */{
    events: {
        "click .attributions-button": "toggleIsContentVisible"
    },
    /**
     * @class AttributionsView
     * @extends Backbone.Model
     * @memberof Attributions
     * @constructs
     * @listens Attributions#RadioTriggerAttributionsRenderAttributions
     * @listens Attributions#changeIsContentVisible
     * @listens Attributions#changeAttributionList
     * @listens Attributions#changeIsVisibleInMap
     * @listens Attributions#AttributionsRenderAttributions
     */
    initialize: function () {
        var channel = Radio.channel("Attributions"),
            jAttributionsConfig = Radio.request("Parser", "getPortalConfig").controls.attributions;

        this.model = new Attributions(jAttributionsConfig);

        this.listenTo(channel, {
            "renderAttributions": this.render
        });

        this.listenTo(this.model, {
            "change:isContentVisible": this.render,
            "change:attributionList": this.render,
            "change:isVisibleInMap": this.readIsVisibleInMap,
            "renderAttributions": this.render
        });

        this.readIsVisibleInMap();
    },
    templateShow: _.template(TemplateShow),
    templateHide: _.template(TemplateHide),

    /**
     * Modules render method. Decides whitch control click icon to show depending on model's isContentVisible property.
     * @return {self}
     */
    render: function () {
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

    /**
     * Wrapper method for model's toggleIsContentVisible()
     * @return {void}
     */
    toggleIsContentVisible: function () {
        return this.model.toggleIsContentVisible();
    },

    /**
     * Decides whether to display the module or to hide it. Uses model property isVisibleInMap for it.
     * @return {void}
     */
    readIsVisibleInMap: function () {
        if (this.model.get("isVisibleInMap")) {
            this.$el.show();
            this.$el.addClass("attributions-view");
        }
        else {
            this.$el.hide();
        }
    }
});

export default AttributionsView;
