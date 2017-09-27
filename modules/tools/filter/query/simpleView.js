define(function (require) {
    var Template = require("text!modules/tools/filter/query/templateSimpleView.html"),
        QuerySimpleView = Backbone.View.extend({
        template: _.template(Template),
        className: "simple-view",
        events: {
            "click": "selectThis"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": function (model, value) {
                    this.render();
                },
                "change:isLayerVisible": this.render
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
            this.model.runFilter();
        }
    });

    return QuerySimpleView;
});
