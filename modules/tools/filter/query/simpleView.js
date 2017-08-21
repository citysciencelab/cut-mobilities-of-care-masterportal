define(function (require) {

    var Backbone = require("backbone"),
        QuerySimpleView;

    QuerySimpleView = Backbone.View.extend({
        initialize: function () {
        },
        render: function () {
            // var attr = this.model.toJSON();
            return this.el;
        }
    });

    return QuerySimpleView;
});
