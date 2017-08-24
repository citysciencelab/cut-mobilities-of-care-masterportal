define(function () {

    var QuerySimpleView = Backbone.View.extend({
        tagName: "button",
        className: "btn btn-default",
        events: {
            "click": "setIsSelectedOnTrue"
        },
        initialize: function () {
            this.listenTo(this.model, "change:isSelected", this.removeBtnClass);
        },

        /**
         * Zeichnet die SimpleView (Filter-Header) für die Query
         */
        render: function () {
            return this.$el.text(this.model.get("name"));
        },

        /**
         *
         */
        setIsSelectedOnTrue: function () {
            // die Query-Collection hört im Filter-Model auf diesen Trigger
            this.model.collection.trigger("deselectAllModels");
            this.model.setIsSelected(true);
            this.addSelectedBtnClass();
        },

        /**
         * Fügt die css-Klasse "btn-select" dem Button hinzu
         */
        addSelectedBtnClass: function () {
            this.$el.addClass("btn-select");
        },

        /**
         * Entfernt die css-Klasse "btn-select" vom Button
         * @param  {Backbone.Model} model - this
         * @param  {boolean} value - model.get("isSelected")
         */
        removeBtnClass: function (model, value) {
            if (value === false) {
                this.$el.removeClass("btn-select");
            }
        }
    });

    return QuerySimpleView;
});
