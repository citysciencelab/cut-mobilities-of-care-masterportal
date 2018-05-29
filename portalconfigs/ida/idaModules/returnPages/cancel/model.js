define(function (require) {
    require("idaModules/wps/model");

    var Backbone = require("backbone"),
        CancelModel;

    CancelModel = Backbone.Model.extend({
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

    return CancelModel;
});
