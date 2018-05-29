define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        CancelModel = require("idaModules/returnPages/cancel/model"),
        Template = require("text!idaModules/returnPages/cancel/template.html"),
        CancelView;

    CancelView = Backbone.View.extend({
        id: "failure",
        model: new CancelModel(),
        template: _.template(Template),
        events: {
            "click #refreshbutton": "reload"
        },
        initialize: function (orderId) {
            Radio.trigger("Info", "setNavStatus", "navbar-5-payment");

            this.model.setOrderId(orderId);
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        },
        reload: function () {
            var path = window.location.origin + window.location.pathname;

            window.location.href = path;
        }
    });

    return CancelView;
});
