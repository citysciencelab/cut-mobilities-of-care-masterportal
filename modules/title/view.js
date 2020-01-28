import Template from "text-loader!./template.html";
import Model from "./model";

const TitleView = Backbone.View.extend(/** @lends TitleView.prototype */{
    /**
     * @class TitleView
     * @extends Backbone.View
     * @memberof Title
     * @constructs
     * @listens Title#RadioTriggerTitleSetSize
     */
    initialize: function () {
        this.model = new Model();

        this.listenTo(Radio.channel("Title"), {
            "setSize": function () {
                this.renderDependingOnSpace();
            }
        });

        window.addEventListener("resize", _.bind(this.renderDependingOnSpace, this));

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function () {
                this.render();
            }
        });

        this.renderDependingOnSpace();
    },
    className: "portal-title",
    id: "portalTitle",
    template: _.template(Template),
    /**
     * Render function for title.
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $(".nav-menu").after(this.$el);

        return this;
    },

    /**
     * Renders the title if enough space available.
     * @returns {void}
     */
    renderDependingOnSpace: function () {
        let navMenuWidth,
            searchbarWidth,
            navBarWidth,
            titleWidth,
            rest;
        const searchBarIconEl = document.getElementById("searchbar"),
            titleEl = document.getElementById("portalTitle");

        if (searchBarIconEl) {
            navMenuWidth = document.getElementById("root").offsetWidth;
            searchbarWidth = document.getElementById("searchForm").offsetWidth + searchBarIconEl.offsetWidth;
            navBarWidth = document.getElementById("main-nav").offsetWidth;
            titleWidth = titleEl ? titleEl.offsetWidth : 0;
            rest = navBarWidth - navMenuWidth - searchbarWidth;

            if (titleWidth > 10) { // sometimes titleEl has width of 10px, i don't know why -> behave like title is not rendered
                if (titleWidth < rest + 40) { // add 40px for a bit space
                    this.render();
                }
                else {
                    this.$el.empty();
                }
            }
            // titleEl is not rendered at this moment
            else if (rest > 500) {
                this.render();
            }
            else {
                this.$el.empty();
            }
        }
    }
});

export default TitleView;
