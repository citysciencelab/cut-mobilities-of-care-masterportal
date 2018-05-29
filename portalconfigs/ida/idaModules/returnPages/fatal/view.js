define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FailureModel = require("idaModules/returnPages/fatal/model"),
        Template = require("text!idaModules/returnPages/fatal/template.html"),
        FatalView;

    FatalView = Backbone.View.extend({
        id: "failure",
        model: new FailureModel(),
        template: _.template(Template),
        initialize: function (orderId) {
            Radio.trigger("Info", "setNavStatus", "navbar-5-payment");

            this.model.setOrderId(orderId);
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        }
    });

    return FatalView;
});
