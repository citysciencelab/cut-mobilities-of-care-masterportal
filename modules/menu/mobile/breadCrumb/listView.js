import List from "./list";
import View from "./view";
import Template from "text-loader!./templateListView.html";

const ListView = Backbone.View.extend(/** @lends ListView.prototype */{
    events: {
        "click ul.back-item": "removeLastItem"
    },

    /**
     * @class ListView
     * @extends Backbone.View
     * @memberof Menu.mobile.breadcrumb
     * @constructs
     * @listens i18next#RadioTriggerLanguageChanged
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

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.render
        });

        this.render();
    },
    collection: {},
    className: "breadcrumb-mobile",
    targetElement: "div.collapse.navbar-collapse",
    template: _.template(Template),

    /**
     * Renders the data to DOM.
     * @return {void}
     */
    render: function () {
        const attr = {backText: i18next.t("common:button.back")};

        this.collection.get("root").set("name", i18next.t("common:menu.name"));
        this.delegateEvents(this.events);
        $(this.targetElement).find("." + this.className).empty();
        $(this.targetElement).prepend(this.$el.html(this.template(attr)));
        this.collection.forEach(this.addViews, this);
        return this;
    },

    /**
     * Every model in the collection gets a new view and the "Breadcrumb-Items" are rendered
     * @param {Backbone.Model} model -
     * @returns {void}
     */
    addViews: function (model) {
        const breadCrumbView = new View({model: model});

        this.$el.find(".breadcrumb").append(breadCrumbView.render().el);
    },

    /**
     * Removes the last item in the collection.
     * @return {void}
     */
    removeLastItem: function () {
        this.collection.removeLastItem();
    },
    /**
     * Removes this view.
     * @return {void}
     */
    removeView: function () {
        this.collection = {};
        this.remove();
    }
});

export default ListView;
