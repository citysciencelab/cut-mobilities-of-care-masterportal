import CookieModel from "./model";
import CookieTemplate from "text-loader!./template.html";

const CookieView = Backbone.View.extend({
    events: {
        "click .close": "buttonclick"
    },
    initialize: function () {
        if (this.model.get("cookieEnabled") === true && this.model.get("approved") === false) {
            this.render();
        }
    },
    model: new CookieModel(),
    template: _.template(CookieTemplate),
    render: function () {
        $("body").append(this.$el.html(this.template()));

        return this;
    },
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
