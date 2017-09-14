define(function (require) {
    var Template = require("text!modules/tools/filter/query/templateSimpleView.html"),
        QuerySimpleView = Backbone.View.extend({
        tagName: "button",
        className: "btn btn-default",
        template: _.template(Template),
        events: {
            "click": "selectThis"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": function (model, value) {
                    this.render();
                    this.toggleButton(value);
                }
            });
            if (this.model.get("isActive")) {
                this.model.runFilter();
            }
        },

        /**
         * Zeichnet die SimpleView (Filter-Header) für die Query
         */
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isSelected")) {
                this.toggleButton(true);
            }
            return this.$el.html(this.template(attr));
        },
        /**
         *
         */
        selectThis: function () {
            if (this.model.get("isSelected") === true) {
                // this.model.setIsActive(false);
                // this.model.setIsSelected(false);
            }
            else {
                // die Query-Collection hört im Filter-Model auf diesen Trigger
                this.model.collection.trigger("deselectAllModels");
                this.model.setIsActive(true);
                this.model.setIsSelected(true);
            }
            // if (this.model.get("isActive")) {
                this.model.runFilter();
            // }
        },

        toggleButton: function (value) {

            if (value === true) {
                this.$el.addClass("btn-select");
            }
            else {
                this.$el.removeClass("btn-select");
            }
        }
    });

    return QuerySimpleView;
});
