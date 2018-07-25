define(function (require) {

    var $ = require("jquery"),
        List = require("modules/menu/mobile/breadCrumb/list"),
        View = require("modules/menu/mobile/breadCrumb/view"),
        Template = require("text!modules/menu/mobile/breadCrumb/templateListView.html"),
        ListView;

    ListView = Backbone.View.extend({
        collection: {},
        className: "breadcrumb-mobile",
        targetElement: "div.collapse.navbar-collapse",
        template: _.template(Template),
        events: {
            "click ul.back-item": "removeLastItem"
        },

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

        render: function () {
            this.delegateEvents(this.events);
            $(this.targetElement).prepend(this.$el.html(this.template()));
            this.collection.forEach(this.addViews, this);
            return this;
        },

        /**
         * Weist jedem Model aus der Collection eine View zu und zeichnet die einzelnen "Breadcrumb-Items"
         * @param {Backbone.Model} model -
         * @returns {void}
         */
        addViews: function (model) {
            var breadCrumbView = new View({model: model});

            this.$el.find(".breadcrumb").append(breadCrumbView.render().el);
        },

        removeLastItem: function () {
            this.collection.removeLastItem();
        },
        removeView: function () {
            this.collection = {};
            this.remove();
        }
    });

    return ListView;
});
