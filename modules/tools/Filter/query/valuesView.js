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
            var html = "";

            if (this.model.get("type") === "boolean") {
                var val = this.model.get("value");

                if (val === "true") {
                    html = "<span>" + this.model.get("attr") + "<span><span class='glyphicon glyphicon-remove'></span>";
                }
                else {
                    // html = "<span class='line-through'>" + this.model.get("attr") + "</span><span class='glyphicon glyphicon-remove'></span>";
                    // html = "<span class='line-through'><span class='value-text'>" + this.model.get("attr") + "</span></span></span><span class='glyphicon glyphicon-remove'></span>";
                    html = "<span class='strikethrough'><span class='value-text'>" + this.model.get("attr") + "</span></span><span class='glyphicon glyphicon-remove'></span>";
                }
            }
            else if (this.model.get("type") === "integer") {
                html = "<span>" + this.model.get("attr") + " " + this.model.get("displayName") + " " + this.model.get("value") + "<span class='glyphicon glyphicon-remove'></span>";
            }
            else {
                html = "" + this.model.get("value") + "<span class='glyphicon glyphicon-remove'></span>";
            }

            return this.$el.html(html);
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
