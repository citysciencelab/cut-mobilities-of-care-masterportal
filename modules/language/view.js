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
            "change:isActive": this.render,
            "change:closeButton": this.render,
            "change:languageTitle": this.render,
            "change:activeCode": this.render
        });

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.render();
            }
        }, this);
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

        this.bindShowLanguageList(this.$el);
        this.bindChangeLanguage(this.$el);
        this.bindClosePopup(this.$el);

        return this;
    },

    /**
     * show the popup window of the language list
     * @param {object} content - the content of current element
     * @returns {void}
     */
    bindShowLanguageList: function (content) {
        content.find(".currentLan").click(function () {
            content.find(".popup-language").show();
        });
    },

    /**
     * change the language when one option is selected
     * @param {object} content - the content of current element
     * @returns {void}
     */
    bindChangeLanguage: function (content) {
        const lngLink = content.find("a.lng");

        lngLink.unbind("click");
        lngLink.click(function () {
            i18next.changeLanguage($(this).data("code"));
            content.find(".popup-language").hide();
        });
    },

    /**
     * close the popup window of the language list
     * @param {object} content - the content of current element
     * @returns {void}
     */
    bindClosePopup: function (content) {
        content.find(".lng-header span").click(function () {
            content.find(".popup-language").hide();
        });
    }
});

export default LanguageView;
