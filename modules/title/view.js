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

        window.addEventListener("resize", this.renderDependingOnSpace.bind(this));


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
            rest,
            doRender = false;
        const titleEl = document.getElementById("portalTitle"),
            titlePadding = 10;

        if (document.getElementById("searchbar")) {
            navMenuWidth = document.getElementById("root").offsetWidth;
            searchbarWidth = document.getElementById("searchForm") !== null ? document.getElementById("searchForm").offsetWidth + 40 : 0; // add width of searchbarIcon
            navBarWidth = document.getElementById("main-nav").offsetWidth;
            titleWidth = titleEl ? titleEl.offsetWidth : 0;
            if (!this.model.get("titleWidth")) {
                if (titleWidth > titlePadding) {
                    this.model.set("titleWidth", titleWidth);
                    this.$el.width(titleWidth);
                }
            }
            else if (titleWidth > this.model.get("titleWidth")) {
                this.model.set("titleWidth", titleWidth);
                this.$el.width(titleWidth);
            }
            else {
                titleWidth = this.model.get("titleWidth");
            }
            rest = navBarWidth - navMenuWidth - searchbarWidth;

            // check if title is smaller than the rest: set new width at el to visualize ... at the end of the title
            if ((rest - titleWidth) < 0 && rest > 0 && (rest - titleWidth) > -(titleWidth - 30)) {
                this.$el.width(rest);
                doRender = true;
            }
            else if (titleWidth > 0) {
                this.$el.width(titleWidth);
            }
            if (doRender) {
                this.render();
            }
            else if (titleWidth < rest && rest > 50) {
                this.render();
            }
            else {
                this.$el.empty();
                // reset width at title, else the header may be wrapped
                this.$el.css("width", "auto");
            }
        }
    }
});

export default TitleView;
