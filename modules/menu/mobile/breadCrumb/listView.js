define([
    "backbone",
    "backbone.radio",
    "modules/menu/mobile/breadCrumb/list",
    "modules/menu/mobile/breadCrumb/view",
    "text!modules/menu/mobile/breadCrumb/templateListView.html"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        List = require("modules/menu/mobile/breadCrumb/list"),
        View = require("modules/menu/mobile/breadCrumb/view"),
        Template = require("text!modules/menu/mobile/breadCrumb/templateListView.html"),
        ListView;

    ListView = Backbone.View.extend({
        collection: {},
        className: "breadcrumb-mobile",
        targetElement: "div.collapse.navbar-collapse",
        template: _.template(Template),
        subviews: [],
        events: {
            "click ul.back-item": "removeLastItem"
        },

        /**
         * Registriert die Listener und ruft die render-Funktion auf
         */
        initialize: function () {
            this.collection = new List();
            this.listenTo(Radio.channel("MenuBar"), {
                // wird ausgeführt wenn das Menü zwischen mobiler Ansicht und Desktop wechselt
                "switchedMenu": this.render
            });

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
            var breadCrumbView = new View({model: model});

            this.subviews.push(breadCrumbView);
            $(".breadcrumb-mobile > .breadcrumb").append(breadCrumbView.render().el);
        },

        /**
         * Ruft removeLastItem in der Collection auf
         * Wird beim Klicken auf den "Zurück-Button" ausgeführt
         */
        removeLastItem: function () {
            this.collection.removeLastItem();
        },
        removeView: function () {
            while (this.subviews.length) {
                this.subviews.pop().remove();
            }
            this.collection = {};

            this.remove();
        }
    });

    return ListView;
});
