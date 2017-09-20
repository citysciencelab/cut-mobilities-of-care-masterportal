define(function () {

    var QueryValuesView = Backbone.View.extend({
        tagName: "span",
        className: "valueView",
        attributes: {
            title: "Auswahl löschen"
        },
        events: {
            "click": "removeView"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "removeView": this.remove
            });
        },
        render: function () {
            var html = "";

            if (this.model.get("type") === "boolean") {
                var val = this.model.get("value");

                if (val === "true") {
                    html = this.model.get("attr") + "<span class='remove'>&#x274C;</span>";
                }
                else {
                    // html = "<span class='line-through'>" + this.model.get("attr") + "</span><span class='glyphicon glyphicon-remove'></span>";
                    // html = "<span class='line-through'><span class='value-text'>" + this.model.get("attr") + "</span></span></span><span class='glyphicon glyphicon-remove'></span>";
                    html = "<span class='strikethrough'>" + this.model.get("attr") + "</span><span class='remove'>&#x274C;</span>";
                }
            }
            else if (this.model.get("type") === "integer") {
                html = this.model.get("attr") + " " + this.model.get("displayName") + " " + this.model.get("value") + "<span class='remove'>&#x274C;</span>";
            }
            else {
                html = this.model.get("value") + "<span class='remove'>&#x274C;</span>";
            }

            this.$el.html(html);
            return this.$el;
        },

        removeView: function () {
            this.model.set("isSelected", false);
            this.remove();
        }
    });

    return QueryValuesView;
});
