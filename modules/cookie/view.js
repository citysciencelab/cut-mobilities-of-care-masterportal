import CookieModel from "./model";
import CookieTemplate from "text-loader!./template.html";

const CookieView = Backbone.View.extend(/**@lends  CookieView.prototype*/{
    events: {
        "click .close": "buttonclick"
    },
    /**
     * @class CookieView
     * @memberof Cookie
     * @extends Backbone.View
     * @constructs
     */
    initialize: function () {
        if (this.model.get("cookieEnabled") === true && this.model.get("approved") === false) {
            this.render();
        }
    },
    model: new CookieModel(),
    /**
     * @member CookieTemplate
     * @description Template used to create the Cookie
     * @memberof Cookie
     */
    template: _.template(CookieTemplate),
    /**
     * Render-function
     * @returns {CookieView} - Returns itself
     */
    render: function () {
        $("body").append(this.$el.html(this.template()));

        return this;
    },

    /**
     *
     * @param {Event} evt
     * @returns {void}
     */
    buttonclick: function (evt) {
        if (evt.currentTarget.id === "cookiefalse") {
            this.model.refusal();
        }
        else if (evt.currentTarget.id === "cookietrue") {
            this.model.approval();
        }
        this.$el.remove();
    }
});

export default CookieView;
