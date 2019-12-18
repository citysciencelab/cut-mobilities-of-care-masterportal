const LanguageModel = Backbone.Model.extend(/** @lends LanguageModel.prototype */ {
    defaults: {
        languageCodes: {},
        activeCode: "",
        closeButton: "",
        languageTitle: ""
    },
    /**
     * @class LanguageModel
     * @extends Backbone.Model
     * @memberof language
     * @constructs
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} activeCode the language changed to
     * @returns {Void}  -
     */
    changeLang: function (activeCode) {
        const languageCodes = i18next.options.getLanguages();

        if (activeCode) {
            this.set("activeCode", activeCode);
        }

        if (languageCodes) {
            this.set("languageCodes", languageCodes);
            this.set({
                closeButton: i18next.t("common:button.close"),
                languageTitle: i18next.t("common:modules.language.languageTitle")
            });
        }
    },

    /**
     * requests util if portal is running on mobile device
     * @returns {Boolean}  - isMobile
     */
    checkIsMobile: function () {
        return Radio.request("Util", "isViewMobile");
    }
});

export default LanguageModel;
