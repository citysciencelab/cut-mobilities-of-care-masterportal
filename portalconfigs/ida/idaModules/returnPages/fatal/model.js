define(function (require) {
    var Backbone = require("backbone"),
        FailureModel;

    FailureModel = Backbone.Model.extend({
        defaults: {
            orderid: ""
        },
        initialize: function () {
        },
        getOrderId: function () {
            return this.get("orderid");
        },
        setOrderId: function (val) {
            this.set("orderid", val);
        }
    });

    return FailureModel;
});
