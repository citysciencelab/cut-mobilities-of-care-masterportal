import ShadowTemplate from "text-loader!./template.html";
import SnippetSliderView from "../../snippets/slider/view";
import SnippetCheckBoxView from "../../snippets/checkbox/view";
/**
 * @member ShadowTemplate
 * @description Template used to style the shadow tool
 * @memberof Shadow
 */
const ShadowView = Backbone.View.extend(/** @lends ShadowView.prototype */{
    /**
     * @class ShadowView
     * @extends Backbone.View
     * @memberof Shadow
     * @constructs
     */

    events: {
        "click .glyphicon-remove": "destroy"
    },

    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "toggleButtonValueChanged": this.toggleElements,
            "shadowUnavailable": this.toggleUnavailableText
        });
    },

    template: _.template(ShadowTemplate),

    /**
     * render method
     * @returns {this} this
     */
    render: function () {
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template({}));
        this.$el.append(new SnippetCheckBoxView({model: this.model.get("toggleButton")}).render().el);
        this.$el.append(new SnippetSliderView({model: this.model.get("timeslider")}).render().$el);
        this.$el.append(new SnippetSliderView({model: this.model.get("dateslider")}).render().$el);
        this.toggleElements(this.model.get("isShadowEnabled"));
        this.delegateEvents();

        return this;
    },

    /**
     * Toggles slider elements according to the checkbox state
     * @param   {boolean} chkBoxValue Value of the checkbox
     * @returns {void}
     */
    toggleElements: function (chkBoxValue) {
        this.$el.find(".slider-container").each(function (index, slider) {
            if (chkBoxValue) {
                slider.style.display = "block";
            }
            else {
                slider.style.display = "none";
            }
        });
    },

    /**
     * Toggles info text
     * @param   {boolean} chkBoxValue Value of the checkbox
     * @returns {void}
     */
    toggleUnavailableText: function (chkBoxValue) {
        if (chkBoxValue === true) {
            this.$el.find(".not3d").hide();
        }
        else {
            this.$el.find(".not3d").show();
        }
    }
});

export default ShadowView;
