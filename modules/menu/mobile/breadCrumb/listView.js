import List from "./list";
import View from "./view";
import Template from "text-loader!./templateListView.html";

const ListView = Backbone.View.extend({
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
    collection: {},
    className: "breadcrumb-mobile",
    targetElement: "div.collapse.navbar-collapse",
    template: _.template(Template),

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

export default ListView;
