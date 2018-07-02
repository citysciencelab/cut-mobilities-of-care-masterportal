define([
    "jquery",
    "backbone",
    "modules/cookie/model",
    "text!modules/cookie/template.html"
], function ($, Backbone, cookieModel, cookieTemplate) {

    var cookieView = Backbone.View.extend({
        model: cookieModel,
        template: _.template(cookieTemplate),
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

    return new cookieView();
});
