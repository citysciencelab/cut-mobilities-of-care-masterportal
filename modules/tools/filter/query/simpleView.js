define(function (require) {
    var Template = require("text!modules/tools/filter/query/templateSimpleView.html"),
        QuerySimpleView = Backbone.View.extend({
        template: _.template(Template),
        className: "simple-view",
        events: {
            "click": "selectModel"
        },
        initialize: function () {
            this.listenToOnce(this.model, {
                "change:isSelected": function (model, value) {
                    if (value) {
                        this.model.setIsActive(value);
                        this.model.runFilter();
                    }
                }
            });
            this.listenTo(this.model, {
                "change:isSelected": function (model, value) {
                    this.render();
                },
                "change:isLayerVisible": this.render
            });
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
        selectModel: function () {
            this.model.selectThis();
        }
    });

    return QuerySimpleView;
});
