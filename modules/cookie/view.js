define(function (require) {
    var $ = require("jquery"),
        CookieModel = require("modules/cookie/model"),
        CookieTemplate = require("text!modules/cookie/template.html"),
        CookieView;

    CookieView = Backbone.View.extend({
        model: new CookieModel(),
        template: _.template(CookieTemplate),
        initialize: function () {
            if (this.model.get("cookieEnabled") === true && this.model.get("approved") === false) {
                this.render();
            }
        },
        events: {
            "click .close": "buttonclick"
        },
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

    return CookieView;
});
