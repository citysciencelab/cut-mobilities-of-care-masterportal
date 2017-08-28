define(function (require) {
    var Template = require("text!modules/tools/filter/query/templateSimpleView.html"),
        QuerySimpleView = Backbone.View.extend({
        // tagName: "button",
        // className: "btn btn-default",
        className: "btn-group simple-view",
        template: _.template(Template),
        events: {
            "click button": "selectThis"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": this.render,
                "change:isActive": this.render
            });
            if (this.model.get("isActive")) {
                this.model.runPredefinedRules();
            }
        },

        /**
         * Zeichnet die SimpleView (Filter-Header) für die Query
         */
        render: function () {
            var attr = this.model.toJSON();

            return this.$el.html(this.template(attr));
        },
        /**
         *
         */
        selectThis: function () {
            // die Query-Collection hört im Filter-Model auf diesen Trigger
            this.model.collection.trigger("deselectAllModels");
            this.model.setIsSelected(true);
            if (this.model.get("isActive")) {
                this.model.runPredefinedRules();
            }
        }
    });

    return QuerySimpleView;
});
