define(function (require) {

    var Backbone = require("backbone"),
        QuerySimpleView;

    QuerySimpleView = Backbone.View.extend({
        events: {
            "click": "setIsSelected"
        },
        initialize: function () {
        },
        render: function () {
            return this.$el.html("<span class='badge'>" + this.model.get("name") + "</span>");
        },

        setIsSelected: function () {
            this.model.trigger("deselectAllModels");
            this.model.setIsSelected(true);
        }
    });

    return QuerySimpleView;
});
