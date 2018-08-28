define(function (require) {

    var Template = require("text!modules/menu/mobile/breadCrumb/template.html"),
        BreadCrumbView;

    BreadCrumbView = Backbone.View.extend({
        tagName: "li",
        template: _.template(Template),
        events: {
            "click": "removeItems"
        },
        initialze: function () {
            this.listenTo(this.model, {
                "remove": this.remove
            });
        },
        /**
         * Zeichnet das Item und gibt es an die ListView zurück
         * @return {Backbone.View} this
         */
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },

        removeItems: function () {
            this.model.removeItems();
        }
    });

    return BreadCrumbView;
});
