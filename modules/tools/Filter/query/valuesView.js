define(function (require) {

    var Backbone = require("backbone"),
        QueryValuesView;

    QueryValuesView = Backbone.View.extend({
        events: {
            "click .close": "removeBadge"
        },
        initialize: function () {
        },
        render: function () {
            if (this.model.get("isSelected")) {
                var html = "<span class='badge'>" + this.model.get("value") + "<button type='button' class='close'><span aria-hidden='true'>&times;</span></button></span>";

                return this.$el.html(html);
            }
        },
        removeBadge: function () {
            this.model.set("isSelected", false);
            this.remove();
        }
    });

    return QueryValuesView;
});
