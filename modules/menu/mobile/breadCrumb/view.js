define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        BreadCrumbView;

    BreadCrumbView = Backbone.View.extend({
        tagName: "li",
        template: _.template("<span><%= name %></span>"),
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

        /**
         * Ruft removeItems im Model auf
         * Wird beim Klicken auf ein "Breadcrumb-Item" ausgeführt
         */
        removeItems: function () {
            this.model.removeItems();
        }
    });

    return BreadCrumbView;
});
