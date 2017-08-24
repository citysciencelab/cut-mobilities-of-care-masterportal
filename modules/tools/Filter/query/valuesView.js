define(function (require) {

    var Backbone = require("backbone"),
        QueryValuesView;

    QueryValuesView = Backbone.View.extend({
        className: "valueView",
        events: {
            "click .glyphicon-remove": "removeBadge"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "removeView": this.removeView
            });
        },
        render: function () {
            if (this.model.get("isSelected")) {
                var html = "" + this.model.get("value") + "<span class='glyphicon glyphicon-remove'></span>";

                return this.$el.html(html);
            }
        },
        removeView: function () {
            this.remove();
        },
        removeBadge: function () {
            this.model.set("isSelected", false);
            this.removeView();
        }
    });

    return QueryValuesView;
});
