import TemplateShow from "text-loader!./templateShow.html";
import TemplateHide from "text-loader!./templateHide.html";
import Attributions from "./model";

const AttributionsView = Backbone.View.extend(/** @lends AttributionsView.prototype */{
    events: {
        "click .attributions-button": "toggleIsContentVisible"
    },
    /**
     * @class AttributionsView
     * @extends Backbone.View
     * @memberof Controls.Attributions
     * @constructs
     * @listens Attributions#RadioTriggerAttributionsRenderAttributions
     * @listens Attributions#changeIsContentVisible
     * @listens Attributions#changeAttributionList
     * @listens Attributions#changeIsVisibleInMap
     * @listens Attributions#renderAttributions
     * @fires Parser#RadioRequestParserGetPortalConfig
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
        this.render();
    },
    /**
     * Shows the attributions pane
     * @returns {void}
     */
    templateShow: _.template(TemplateShow),

    /**
     * Hides the attributions pane
     * @returns {void}
     */
    templateHide: _.template(TemplateHide),
    /**
     * Modules render method. Decides whitch control click icon to show depending on model's isContentVisible property.
     * @returns {object} self
     */
    render: function () {
        var attr = this.model.toJSON();

        if (this.model.get("isContentVisible") === true && this.model.get("attributionList").length > 0) {
            this.$el.html(this.templateShow(attr));
            this.$(".attributions-div").addClass("attributions-div");
        }
        else {
            this.$el.html(this.templateHide(attr));
            this.$(".attributions-div").removeClass("attributions-div");
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
