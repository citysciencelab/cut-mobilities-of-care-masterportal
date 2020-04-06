import AttributionsTemplateShow from "text-loader!./templateShow.html";
import AttributionsTemplateHide from "text-loader!./templateHide.html";
import AttributionsControlModel from "./model";

/**
 * @member AttributionsTemplateShow
 * @description template used if attributions are shown
 * @memberof Controls.Attributions
 */
/**
 * @member AttributionsTemplateHide
 * @description template used if attributions are hidden
 * @memberof Controls.Attributions
 */

const AttributionsControlView = Backbone.View.extend(/** @lends AttributionsControlView.prototype */{
    events: {
        "click .attributions-button": "toggleIsContentVisible"
    },

    /**
     * @class AttributionsControlView
     * @extends Backbone.View
     * @memberof Controls.Attributions
     * @constructs
     * @listens Controls.Attributions#RadioTriggerAttributionsRenderAttributions
     * @listens Controls.Attributions#changeIsContentVisible
     * @listens Controls.Attributions#changeAttributionList
     * @listens Controls.Attributions#changeIsVisibleInMap
     * @listens Controls.Attributions#renderAttributions
     * @listens Controls.Attributions#changeShowAttributionsText
     * @listens Controls.Attributions#changeHideAttributionsText
     * @fires Core.ConfigLoader#RadioRequestParserGetPortalConfig
     */
    initialize: function () {
        const attributionsConfig = Radio.request("Parser", "getPortalConfig").controls.attributions;

        this.model = new AttributionsControlModel(attributionsConfig);
        this.listenTo(Radio.channel("Attributions"), {
            "renderAttributions": this.render
        });

        this.listenTo(this.model, {
            "renderAttributions": this.render,
            "change": function () {
                const changed = this.model.changed;

                if (changed.hasOwnProperty("isContentVisible")) {
                    this.render();
                }
                else if (changed.hasOwnProperty("attributionList")) {
                    this.render();
                }
                else if (changed.hasOwnProperty("isVisibleInMap")) {
                    this.readIsVisibleInMap();
                }
                else if (changed.showAttributionsText || changed.hideAttributionsText) {
                    this.render();
                }
            }
        });

        this.readIsVisibleInMap();
        this.render();
    },

    /**
     * Modules render method. Decides whitch control click icon to show depending on models isContentVisible and attributionList property.
     * @returns {this}  -
     */
    render: function () {
        const attr = this.model.toJSON();
        let templateShow,
            templateHide;

        if (this.model.get("isContentVisible") === true && this.model.get("attributionList").length > 0) {
            templateShow = _.template(AttributionsTemplateShow);

            this.$el.html(templateShow(attr));
            this.$(".attributions-div").addClass("attributions-div");
        }
        else {
            templateHide = _.template(AttributionsTemplateHide);

            this.$el.html(templateHide(attr));
            this.$(".attributions-div").removeClass("attributions-div");
        }

        return this;
    },

    /**
     * Wrapper method for models toggleIsContentVisible()
     * @post the moduls function toggleIsContentVisible has been called - see modul for details
     * @return {Void}  -
     */
    toggleIsContentVisible: function () {
        return this.model.toggleIsContentVisible();
    },

    /**
     * Decides whether to display the module or to hide it. Uses model property isVisibleInMap for it.
     * @return {Void}  -
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

export default AttributionsControlView;
