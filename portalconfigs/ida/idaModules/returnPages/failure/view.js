define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FailureModel = require("idaModules/returnPages/failure/model"),
        Template = require("text!idaModules/returnPages/failure/template.html"),
        FailureView;

    FailureView = Backbone.View.extend({
        id: "failure",
        model: new FailureModel(),
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

    return FailureView;
});
