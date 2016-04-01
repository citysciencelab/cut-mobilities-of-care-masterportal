define([
    "backbone",
    "modules/treeMobile/breadCrumb/list",
    "modules/treeMobile/breadCrumb/view",
    "text!modules/treeMobile/breadCrumb/template.html"
], function () {

    var Backbone = require("backbone"),
        BreadCrumbList = require("modules/treeMobile/breadCrumb/list"),
        BreadCrumbView = require("modules/treeMobile/breadCrumb/view"),
        BreadCrumbTemplate = require("text!modules/treeMobile/breadCrumb/template.html"),
        BreadCrumbListView;

    BreadCrumbListView = Backbone.View.extend({
        collection: new BreadCrumbList(),
        className: "breadcrumb-mobile",
        targetElement: "div.collapse.navbar-collapse",
        template: _.template(BreadCrumbTemplate),
        events: {
            "click ul.back-item": "removeLastItem"
        },

        /**
         * Registriert die Listener und ruft die render-Funktion auf
         */
        initialize: function () {
            this.listenTo(this.collection, {
                "add": this.render,
                "remove": this.render
            });

            this.render();
        },

        /**
         * Zeichnet das Breadcrumb
         */
        render: function () {
            this.delegateEvents(this.events);
            $(this.targetElement).prepend(this.$el.html(this.template()));
            this.collection.forEach(this.addViews, this);
        },

        /**
         * Weist jedem Model aus der Collection eine View zu und zeichnet die einzelnen "Breadcrumb-Items"
         * @param {Backbone.Model} model
         */
        addViews: function (model) {
            var breadCrumbView = new BreadCrumbView({model: model});

            $(".breadcrumb-mobile > .breadcrumb").append(breadCrumbView.render().el);
        },

        /**
         * Ruft removeLastItem in der Collection auf
         * Wird beim Klicken auf den "Zurück-Button" ausgeführt
         */
        removeLastItem: function () {
            this.collection.removeLastItem();
        }
    });

    return BreadCrumbListView;
});
