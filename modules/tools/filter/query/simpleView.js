define(function (require) {
    var Template = require("text!modules/tools/filter/query/templateSimpleView.html"),
        QuerySimpleView = Backbone.View.extend({
        // tagName: "button",
        // className: "btn btn-default",
        className: "btn-group simple-view",
        template: _.template(Template),
        events: {
            "click .name": "selectThis",
            "click .glyphicon-eye-open": "deactivate",
            "click .strikethrough-glyph": "activate"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSelected": this.render,
                "change:isActive": this.render
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
        deactivate: function () {
            this.model.setIsActive(false);
            this.model.runFilter();
        },
        activate: function () {
            this.model.setIsActive(true);
            this.model.runFilter();
        },
        /**
         *
         */
        selectThis: function () {
            // die Query-Collection hört im Filter-Model auf diesen Trigger
            this.model.collection.trigger("deselectAllModels");
            this.model.setIsSelected(true);
            this.model.setIsActive(true);
            if (this.model.get("isActive")) {
                this.model.runFilter();
            }
        }
    });

    return QuerySimpleView;
});
