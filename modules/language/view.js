import Template from "text-loader!./template.html";
import Model from "./model";

const LanguageView = Backbone.View.extend(/** @lends LanguageView.prototype */{
    /**
     * @class LanguageView
     * @extends Backbone.View
     * @memberof language
     * @constructs
     */
    initialize: function () {
        this.model = new Model();

        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        this.listenTo(this.model, {
            "change": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },

    className: "language-switch",
    id: "languagebar",
    template: _.template(Template),
    /**
     * Render function for title.
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));

        if (!this.model.checkIsMobile()) {
            $("#searchbar").after(this.$el);
        }
        else {
            $(".footer").append(this.$el);
        }

        this.showLanguageList(this.$el);
        this.changeLanguage(this.$el);
        this.closePopup(this.$el);

        return this;
    },

    /**
     * change the language when one option is selected
     * @param {object} content - the content of current element
     * @returns {void}
     */
    changeLanguage: function (content) {
        const lngLink = content.find("a.lng");

        lngLink.unbind("click");
        lngLink.click(function () {
            i18next.changeLanguage($(this).data("code"));
            content.find(".popup-language").hide();
        });
    },

    /**
     * show the popup window of the language list
     * @param {object} content - the content of current element
     * @returns {void}
     */
    showLanguageList: function (content) {
        content.find(".currentLan").click(function () {
            content.find(".popup-language").show();
        });
    },

    /**
     * close the popup window of the language list
     * @param {object} content - the content of current element
     * @returns {void}
     */
    closePopup: function (content) {
        content.find(".lng-header span").click(function () {
            content.find(".popup-language").hide();
        });
    }
});

export default LanguageView;
