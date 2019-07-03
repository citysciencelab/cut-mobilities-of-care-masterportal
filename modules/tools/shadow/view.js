import ShadowTemplate from "text-loader!./template.html";
import SnippetSliderView from "../../snippets/slider/view";
import SnippetCheckBoxView from "../../snippets/checkbox/view";
import SnippetDatepickerView from "../../snippets/datepicker/view";
/**
 * @member ShadowTemplate
 * @description Template used to style the shadow tool
 * @memberof Tools.Shadow
 */
const ShadowView = Backbone.View.extend(/** @lends ShadowView.prototype */{
    /**
     * @class ShadowView
     * @extends Backbone.View
     * @memberof Tools.Shadow
     * @constructs
     */

    events: {
        "click .glyphicon-remove": "destroy"
    },

    initialize: function () {
        this.toggleButtonView = new SnippetCheckBoxView({model: this.model.get("toggleButton")});
        this.datepickerView = new SnippetDatepickerView({model: this.model.get("datepicker")});
        this.timesliderView = new SnippetSliderView({model: this.model.get("timeslider")});
        this.datesliderView = new SnippetSliderView({model: this.model.get("dateslider")});
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
        if (this.model.get("isActive")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template({}));
            this.$el.append(this.toggleButtonView.render().el);
            this.$el.append(this.datepickerView.render().el);
            this.$el.append(this.timesliderView.render().el);
            this.$el.append(this.datesliderView.render().el);
            this.toggleElements(this.model.get("isShadowEnabled"));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }

        return this;
    },

    /**
     * Toggles slider elements according to the checkbox state
     * @param   {boolean} chkBoxValue Value of the checkbox
     * @returns {void}
     */
    toggleElements: function (chkBoxValue) {
        this.$el.find(".slider-container, .datepicker-container").each(function (index, slider) {
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
